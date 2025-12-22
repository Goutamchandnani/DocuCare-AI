import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ImageAnnotatorClient, protos } from '@google-cloud/vision'
import { Storage } from '@google-cloud/storage'
import axios from 'axios'

const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID;
const GCS_INPUT_BUCKET = process.env.GCS_INPUT_BUCKET;
const GCS_OUTPUT_BUCKET = process.env.GCS_OUTPUT_BUCKET;

if (!GCS_PROJECT_ID || !GCS_INPUT_BUCKET || !GCS_OUTPUT_BUCKET) {
  console.error("Missing Google Cloud Storage environment variables. Please set GCS_PROJECT_ID, GCS_INPUT_BUCKET, and GCS_OUTPUT_BUCKET.");
  // In a real application, you might want to throw an error or handle this more gracefully.
}


export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { fileUrl } = body

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }

    // Initialize Google Cloud Vision client
    // Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set to the path of your service account key file.
    const client = new ImageAnnotatorClient()

    let extractedText = ''

    // Determine file type based on extension
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase()

    if (fileExtension === 'pdf') {
      if (!GCS_PROJECT_ID || !GCS_INPUT_BUCKET || !GCS_OUTPUT_BUCKET) {
        return NextResponse.json({ error: 'Google Cloud Storage environment variables not configured for PDF OCR.' }, { status: 500 });
      }

      const storageClient = new Storage({ projectId: GCS_PROJECT_ID });
      const inputBucket = storageClient.bucket(GCS_INPUT_BUCKET);
      const outputBucket = storageClient.bucket(GCS_OUTPUT_BUCKET);

      const gcsFileName = `pdf_input/${user.id}/${Date.now()}-${fileUrl.split('/').pop()}`;
      const gcsOutputPrefix = `pdf_output/${user.id}/${Date.now()}-`;

      // 1. Download PDF from Supabase Storage
      const pdfResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const pdfBuffer = Buffer.from(pdfResponse.data as ArrayBuffer);

      // 2. Upload PDF to GCS input bucket
      const inputFile = inputBucket.file(gcsFileName);
      await inputFile.save(pdfBuffer, { contentType: 'application/pdf' });

      const gcsSourceUri = `gs://${GCS_INPUT_BUCKET}/${gcsFileName}`;
      const gcsDestinationUri = `gs://${GCS_OUTPUT_BUCKET}/${gcsOutputPrefix}`;

      const inputConfig = {
        gcsSource: { uri: gcsSourceUri },
        mimeType: 'application/pdf',
      };
      const outputConfig = {
        gcsDestination: { uri: gcsDestinationUri },
        batchSize: 10, // Process 10 pages per response file
      };
      const features: protos.google.cloud.vision.v1.IFeature[] = [{ type: protos.google.cloud.vision.v1.Feature.Type.DOCUMENT_TEXT_DETECTION }];

      const request = {
        requests: [{
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        }],
      };

      // 3. Initiate asynchronous OCR request
      const [operation] = await client.asyncBatchAnnotateFiles(request);

      // 4. Poll for operation completion
      const [filesResponse] = await operation.promise();

      // 5. Retrieve and process OCR results from GCS output bucket
      let fullText = '';
      for (const response of filesResponse.responses) {
        const gcsDestination = response.outputConfig?.gcsDestination;
        if (gcsDestination?.uri) {
          const prefix = gcsDestination.uri.replace(`gs://${GCS_OUTPUT_BUCKET}/`, '');
          const [files] = await outputBucket.getFiles({ prefix: prefix });

          for (const file of files) {
            const contents = await file.download();
            const json = JSON.parse(contents.toString());
            for (const pageResponse of json.responses) {
              fullText += pageResponse.fullTextAnnotation?.text || '';
            }
          }
        }
      }
      extractedText = fullText;

      // 6. Clean up GCS buckets
      await inputFile.delete();
      const [outputFiles] = await outputBucket.getFiles({ prefix: gcsOutputPrefix });
      for (const file of outputFiles) {
        await file.delete();
      }

    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
      // Process image file
      const [result] = await client.textDetection({
        image: { source: { imageUri: fileUrl } },
      })

      extractedText = result.fullTextAnnotation?.text || 'No text found.'
    } else {
      return NextResponse.json({ error: 'Unsupported file type for OCR' }, { status: 400 })
    }

    return NextResponse.json({ extractedText }, { status: 200 })
  } catch (error) {
    console.error('Error in OCR API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

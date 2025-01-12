import { parseStringPromise } from 'xml2js';

export const fetchFirstThreeImages = async () => {
    const bucketName = "prateek-test-interview";
    const region = "ap-south-1";
    const folder = "images";

    try {
        const response = await fetch(
            `https://${bucketName}.s3.${region}.amazonaws.com?prefix=${folder}/`, {
                next: {
                    revalidate: 2
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch bucket contents: ${response.statusText}`);
        }

        const textResponse = await response.text();

        // Using xml2js to parse the XML
        const parsedData = await parseStringPromise(textResponse);

        // Extracting the keys from the parsed XML data
        const keys = parsedData.ListBucketResult.Contents.map(item => item.Key[0]);

        const imageUrls = keys.slice(0, 3).map(key => 
            `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
        );

        return imageUrls;
    } catch (err) {
        console.error("Error fetching images from S3:", err);
        return [];
    }
};

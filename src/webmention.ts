async function sendWebmention(sourceUrl: string, targetUrl: string): Promise<void> {
    try {
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                source: sourceUrl,
                target: targetUrl,
            }).toString(),
        });

        if (response.ok) {
            console.log("Webmention sent successfully!");
        } else {
            console.error(`Failed to send Webmention: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error sending Webmention:", error);
    }
}

const sourceUrl = "https://example.com/my-post";
const targetUrl = "https://webmention.io/example/endpoint";
sendWebmention(sourceUrl, targetUrl);

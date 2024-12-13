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

async function discoverWebmentionEndpoint(targetUrl: string): Promise<string | null> {
    try {
        // Step 1: Fetch the target URL
        const response = await fetch(targetUrl);

        // Step 2: Check if the response is valid and content type is HTML
        if (!response.ok) {
            throw new Error(`Failed to fetch target URL: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
            throw new Error("Content is not HTML.");
        }

        // Step 3: Check for HTTP Link Header with rel="webmention"
        const linkHeader = response.headers.get("link");
        if (linkHeader) {
            const match = linkHeader.match(/<([^>]+)>;\s*rel="webmention"/i);
            if (match) {
                return match[1]; // Return the endpoint from the Link header
            }
        }

        // Step 4: Parse HTML and look for <link> or <a> with rel="webmention"
        const html = await response.text();
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(html, "text/html");

        // Check <link> tags
        const linkElement = doc.querySelector('link[rel="webmention"]');
        if (linkElement && linkElement.getAttribute("href")) {
            return linkElement.getAttribute("href")!;
        }

        // Check <a> tags
        const aElement = doc.querySelector('a[rel="webmention"]');
        if (aElement && aElement.getAttribute("href")) {
            return aElement.getAttribute("href")!;
        }

        // No endpoint found
        return null;
    } catch (error) {
        console.error("Error discovering Webmention endpoint:", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    (async () => {
        const sourceUrl = "https://webmmention-workshop.vercel.app/";
        const targetUrl = "https://webmention-client.vercel.app/";
        console.log("Source URL:", sourceUrl);
        //sendWebmention(sourceUrl, targetUrl);
        const web_button = document.getElementById("webmention_button");
        let webmentionEndpoint;
        web_button?.addEventListener("click", async function(){
            console.log("Webmention button clicked");
            webmentionEndpoint = await discoverWebmentionEndpoint(targetUrl);
            if (webmentionEndpoint) {
                sendWebmention(sourceUrl, webmentionEndpoint.toString());
            } else {
                console.log("No Webmention endpoint found.");
            }
            
            if (webmentionEndpoint) {
                console.log("Webmention endpoint discovered:", webmentionEndpoint);
            } else {
                console.log("No Webmention endpoint found.");
            }
        });
    
    })();    
})    

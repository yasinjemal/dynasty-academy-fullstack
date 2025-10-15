import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'spotify-auth-error', error: '${error}' }, '*');
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  if (!code) {
    return new NextResponse("No authorization code provided", { status: 400 });
  }

  try {
    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    // Send token to parent window and close popup
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'spotify-auth-success', 
              token: '${tokenData.access_token}',
              refreshToken: '${tokenData.refresh_token}',
              expiresIn: ${tokenData.expires_in}
            }, '*');
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Spotify OAuth error:", error);
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'spotify-auth-error', error: 'Failed to authenticate' }, '*');
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

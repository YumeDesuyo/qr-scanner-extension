const scanBtn = document.getElementById('scanBtn');
const historyBtn = document.getElementById('historyBtn');
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


            saveHistory(code.data);

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
  function saveHistory(text) {

    const item = {
      text: text,
      time: new Date().toLocaleString()
    };

    chrome.storage.local.get(
      ['qrHistory'],
      (result) => {

        const history = result.qrHistory || [];

        history.unshift(item);

        // 最多保存 100 条
        if (history.length > 100) {
          history.pop();
        }

        chrome.storage.local.set({
          qrHistory: history
        });
      }
    );
  }


});

function loadHistory() {

  chrome.storage.local.get(
    ['qrHistory'],
    (result) => {

      const history = result.qrHistory || [];

      if (history.length === 0) {
        resultDiv.innerHTML = 'No history';
        return;
      }

      // 只取最近 10 条
      const recentHistory = history.slice(0, 10);

      let html = '<h3>Recent History</h3>';

      recentHistory.forEach((item) => {

        html += `
          <div class="history-item">

            <div>${item.text}</div>

            <div class="history-time">
              ${item.time}
            </div>

          </div>
        `;
      });

      resultDiv.innerHTML = html;
    }
  );
}


historyBtn.addEventListener('click', loadHistory);


loadHistory();
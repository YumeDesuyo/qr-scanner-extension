const scanBtn = document.getElementById('scanBtn');
const clearBtn = document.getElementById('clearBtn');
const resultDiv = document.getElementById('result');

scanBtn.addEventListener('click', async () => {

  resultDiv.innerText = 'Scanning...';

  try {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.captureVisibleTab(
      tab.windowId,
      { format: 'png' },

      async (dataUrl) => {

        const img = new Image();

        img.onload = () => {

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
          );

          if (code) {

            saveHistory(code.data);

            loadHistory();

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

      history.splice(10);

      chrome.storage.local.set({
        qrHistory: history
      });
    }
  );
}

function loadHistory() {

  chrome.storage.local.get(
    ['qrHistory'],
    (result) => {

      const history = result.qrHistory || [];

      if (history.length === 0) {

        resultDiv.innerHTML = `
          <div class="history-item">
            No history
          </div>
        `;

        return;
      }

      let html = '';

      history.forEach((item) => {

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

clearBtn.addEventListener('click', () => {

  chrome.storage.local.remove(
    'qrHistory',
    () => {

      loadHistory();

    }
  );

});

loadHistory();
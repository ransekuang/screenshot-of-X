window.addEventListener('error', function(event) {
  console.error('全局错误:', event.error);
  console.error('错误堆栈:', event.error.stack);
});

console.log('内容脚本开始运行');

console.log('html2canvas 版本:', html2canvas.version);

// 添加一个简洁的指示器
const indicator = document.createElement('div');
indicator.textContent = 'X';
indicator.style.position = 'fixed';
indicator.style.top = '5px';
indicator.style.left = '5px';
indicator.style.backgroundColor = 'yellow';
indicator.style.color = 'black';
indicator.style.borderRadius = '50%';
indicator.style.width = '20px';
indicator.style.height = '20px';
indicator.style.display = 'flex';
indicator.style.justifyContent = 'center';
indicator.style.alignItems = 'center';
indicator.style.fontSize = '12px';
indicator.style.fontWeight = 'bold';
indicator.style.zIndex = '9999';
document.body.appendChild(indicator);

function captureTweet(tweetElement) {
  console.log('开始捕获推文');
  if (tweetElement) {
    console.log('找到推文元素，开始生成截图');
    
    const backgroundColor = window.getComputedStyle(document.body).backgroundColor;
    const isDarkMode = backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 1)';
    
    const wrapper = document.createElement('div');
    wrapper.style.backgroundColor = isDarkMode ? 'rgb(21, 32, 43)' : 'white';
    wrapper.style.padding = '20px';
    wrapper.style.width = '600px'; // 设置固定宽度
    wrapper.style.wordWrap = 'break-word'; // 允许长单词换行
    wrapper.style.whiteSpace = 'pre-wrap'; // 保留空格和换行
    
    const clonedTweet = tweetElement.cloneNode(true);
    
    // 处理文本内容
    const tweetTextElement = clonedTweet.querySelector('[data-testid="tweetText"]');
    if (tweetTextElement) {
      const originalText = tweetTextElement.innerText;
      const wrappedText = wrapText(originalText, 50);
      tweetTextElement.innerText = wrappedText;
    }
    
    // 处理图片
    const imageContainer = clonedTweet.querySelector('[data-testid="tweetPhoto"]');
    if (imageContainer) {
      const images = imageContainer.querySelectorAll('img');
      images.forEach(img => {
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
      });
    }
    
    wrapper.appendChild(clonedTweet);
    document.body.appendChild(wrapper); // 临时添加到 DOM 中

    html2canvas(wrapper, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: isDarkMode ? 'rgb(21, 32, 43)' : 'white',
      scale: 2,
      logging: true,
      onclone: function(clonedDoc) {
        const clonedTweet = clonedDoc.querySelector('.screenshot-btn');
        if (clonedTweet) {
          clonedTweet.remove();
        }
      }
    }).then(canvas => {
      console.log('截图生成成功，准备下载');
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = 'tweet-screenshot.png';
      link.click();
      console.log('图片下载已触发');
    }).catch(error => {
      console.error('生成截图时出错:', error);
      console.error('错误堆栈:', error.stack);
      alert('截图生成失败，请查看控制台以获取详细信息。');
    }).finally(() => {
      document.body.removeChild(wrapper); // 移除临时添加的元素
    });
  } else {
    console.log('未找到推文元素');
  }
}

// 辅助函数：将文本按指定长度换行
function wrapText(text, maxLength) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      if (word.length > maxLength) {
        // 处理超长单词
        for (let i = 0; i < word.length; i += maxLength) {
          lines.push(word.slice(i, i + maxLength));
        }
      } else {
        currentLine = word;
      }
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines.join('\n');
}

// 添加截图按钮到推文
function addScreenshotButton() {
  try {
    const tweets = document.querySelectorAll('article');
    tweets.forEach(tweet => {
      if (!tweet.querySelector('.screenshot-btn')) {
        const header = tweet.querySelector('div[data-testid="User-Name"]');
        if (header) {
          const button = document.createElement('span'); // 改用 span 元素
          button.textContent = '截图';
          button.className = 'screenshot-btn';
          button.style.marginLeft = '10px';
          button.style.padding = '2px 5px';
          button.style.fontSize = '14px'; // 稍微增大字体大小
          button.style.fontWeight = 'bold'; // 粗体
          button.style.fontStyle = 'italic'; // 斜体
          button.style.color = 'white'; // 白色文字
          button.style.backgroundColor = 'transparent'; // 透明背景
          button.style.cursor = 'pointer';
          button.style.userSelect = 'none'; // 防止文本被选中
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            captureTweet(tweet);
          });
          header.appendChild(button);
        }
      }
    });
  } catch (error) {
    console.error('添加截图按钮时出错:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 监听页面变化，动态添加截图按钮
const observer = new MutationObserver(addScreenshotButton);
observer.observe(document.body, { childList: true, subtree: true });

// 初始添加截图按钮
addScreenshotButton();

console.log('X.com 推文截图工具已加载');
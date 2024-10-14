document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('cardContainer');
    const startButton = document.getElementById('startGame');
    const timerDisplay = document.getElementById('timerDisplay');
    const elapsedTimeDisplay = document.getElementById('elapsedTimeDisplay');
    const themeSelect = document.getElementById('themeSelect');
    const gridSizeSelect = document.getElementById('gridSizeSelect');
    const flipBackTimeSelect = document.getElementById('flipBackTimeSelect');
    const hideCompletedSelect = document.getElementById('hideCompletedSelect');

    const purpleThemeBackImages = [
        'photo/Xin1.jpg', 'photo/Xin2.jpg', 'photo/Xin3.jpg',
        'photo/Xin4.jpg', 'photo/Xin5.jpg', 'photo/Xin6.jpg',
        'photo/Xin7.jpg', 'photo/Xin8.jpg', 'photo/Xin9.jpg',
        'photo/Xin10.jpg', 'photo/Xin11.jpg', 'photo/Xin12.jpg',
        'photo/Xin13.jpg', 'photo/Xin14.jpg', 'photo/Xin15.jpg',
        'photo/Xin16.jpg', 'photo/Xin17.jpg', 'photo/Xin18.jpg'
    ];

    const blueThemeBackImages = [
        'photo/TNT1.jpg', 'photo/TNT2.jpg', 'photo/TNT3.jpg',
        'photo/TNT4.jpg', 'photo/TNT5.jpg', 'photo/TNT6.jpg',
        'photo/TNT7.jpg', 'photo/TNT8.jpg', 'photo/TNT9.jpg',
        'photo/TNT10.jpg', 'photo/TNT11.jpg', 'photo/TNT12.jpg',
        'photo/TNT13.jpg', 'photo/TNT14.jpg', 'photo/TNT15.jpg',
        'photo/TNT16.jpg', 'photo/TNT17.jpg', 'photo/TNT18.jpg'
    ];

    let cards = [];
    let countdownInterval;
    let elapsedInterval;
    let cardsLocked = false;
    let flippedCards = [];
    let pairsFound = 0;
    let startTime;
    let elapsedTimeStart;
    let countdownTime;

    const flipSound = new Audio('music/翻牌.mp3');
    const successSound = new Audio('music/成功.mp3');
    const failSound = new Audio('music/失敗.mp3');

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getBackImages() {
        return themeSelect.value === 'blue' ? blueThemeBackImages : purpleThemeBackImages;
    }

    const frontImages = {
        purple: 'photo/cover1.png',
        blue: 'photo/cover2.png'
    };

    function resetGame() {
        cards = [];
        countdownTime = 0;
        pairsFound = 0;
        flippedCards = [];
        cardsLocked = false;
        clearInterval(countdownInterval);
        clearInterval(elapsedInterval);
        timerDisplay.style.display = 'none';
        elapsedTimeDisplay.style.display = 'none';
        cardContainer.innerHTML = ''; // 清空卡片
    }

    function createCards() {
        const backImages = getBackImages();
        const gridSize = parseInt(gridSizeSelect.value);
        const totalCards = (gridSize * gridSize) / 2;

        const availableBackImages = backImages.slice(0, totalCards);
        if (availableBackImages.length < totalCards) {
            return; // 移除 alert
        }

        cardContainer.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
        cardContainer.style.gridTemplateRows = `repeat(${gridSize}, 150px)`;

        availableBackImages.forEach(backImage => {
            const frontImage = frontImages[themeSelect.value];
            cards.push({ front: frontImage, back: backImage });
            cards.push({ front: frontImage, back: backImage });
        });

        shuffle(cards);
        cardContainer.innerHTML = '';

        cards.forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('card');

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            const frontImg = document.createElement('img');
            frontImg.src = cardData.front;
            frontImg.alt = '卡牌正面';
            cardFront.appendChild(frontImg);

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            const backImg = document.createElement('img');
            backImg.src = cardData.back;
            backImg.alt = '卡牌背面';
            cardBack.appendChild(backImg);

            card.appendChild(cardBack); // 背面放在前面
            card.appendChild(cardFront); // 正面放在後面
            cardContainer.appendChild(card);

            card.onclick = () => handleCardClick(card);
        });
    }

    


function handleCardClick(card) {
    if (!cardsLocked && flippedCards.length < 2 && !flippedCards.includes(card) && countdownTime <= 0) {
        // 翻轉當前卡牌
        card.classList.toggle('flipped');
        flippedCards.push(card);
        flipSound.play(); // 播放翻牌音效

        if (flippedCards.length === 2) {
            const card1Back = flippedCards[0].querySelector('.card-back img').src;
            const card2Back = flippedCards[1].querySelector('.card-back img').src;

            if (card1Back === card2Back) {
                pairsFound++;
                successSound.play(); // 播放成功音效

                // 根據選擇隱藏或保持卡牌狀態
                const hideCompleted = hideCompletedSelect.value === 'yes';
                setTimeout(() => {
                    if (hideCompleted) {
                        flippedCards.forEach(flippedCard => {
                            flippedCard.style.opacity = '0'; // 在原地隱藏卡牌
                        });
                    } else {
                        // 當選擇「否」，保持卡牌顯示並鎖定
                        flippedCards.forEach(flippedCard => {
                            flippedCard.classList.add('matched'); // 標記為配對成功
                            flippedCard.classList.add('locked'); // 標記為鎖定狀態
                        });
                    }
                    // 鎖住卡牌以防再次點擊，但不影響其他卡牌
                    flippedCards = [];
                }, 2000); // 2 秒後執行隱藏或保持狀態

                // 檢查是否完成遊戲
                setTimeout(() => {
                    if (pairsFound === cards.length / 2) {
                        const totalTime = Math.round((new Date() - startTime) / 1000);
                        clearInterval(elapsedInterval);
                        elapsedTimeDisplay.textContent = `總花費時間: ${totalTime} 秒`;
                        elapsedTimeDisplay.style.display = 'block'; // 顯示已用時間
                        
                        // 使用 SweetAlert2 顯示祝賀訊息
                        Swal.fire({
                            title: '恭喜！你完成了遊戲！',
                            text: `總花費時間: ${totalTime} 秒`,
                            icon: 'success',
                            confirmButtonText: '太棒了！'
                        });
                    }
                }, 2000); // 2 秒後檢查是否完成
                
            } else {
                cardsLocked = true; // 鎖住卡牌
                failSound.play(); // 播放失敗音效
                const flipBackTime = 1.5; // 設定為 1.5 秒
                setTimeout(() => {
                    flippedCards.forEach(flippedCard => flippedCard.classList.remove('flipped')); // 重新翻回背面
                    flippedCards = [];
                    cardsLocked = false; // 解除鎖定，允許再次點擊
                }, flipBackTime * 1000);
            }
        }
    }
}
    
    
    
    function updateTimerDisplay(seconds) {
        timerDisplay.textContent = `剩餘時間: ${seconds}秒`;
    }

    function updateElapsedTimeDisplay(seconds) {
        elapsedTimeDisplay.textContent = `已用時間: ${seconds}秒`;
    }

    startButton.onclick = () => {
        resetGame(); // 重置遊戲
        createCards();

        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.classList.remove('flipped');
            card.querySelector('.card-front').style.display = 'block'; // 顯示正面
        });

        startTime = new Date();
        countdownTime = parseInt(flipBackTimeSelect.value); // 使用選擇的倒數時間
        updateTimerDisplay(countdownTime);
        timerDisplay.style.display = 'block'; // 顯示剩餘時間
        elapsedTimeDisplay.style.display = 'none'; // 隱藏已用時間

        setTimeout(() => {
            allCards.forEach(card => card.classList.add('flipped')); // 翻轉到正面
        }, 0);

        countdownInterval = setInterval(() => {
            countdownTime--;
            updateTimerDisplay(countdownTime);

            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                cardsLocked = true; // 鎖定卡牌

                setTimeout(() => {
                    allCards.forEach(card => {
                        card.classList.remove('flipped'); // 將所有卡片翻轉到背面
                        card.querySelector('.card-front').style.display = 'block'; // 顯示背面
                    });
                    flippedCards = [];
                    cardsLocked = false; // 解鎖卡牌
                    timerDisplay.style.display = 'none'; // 隱藏剩餘時間
                    startElapsedTime(); // 開始計算已用時間
                }, 2000);
            }
        }, 1000);
    };

    function startElapsedTime() {
        elapsedTimeStart = new Date(); // 設定已用時間的開始時間
        elapsedInterval = setInterval(() => {
            const seconds = Math.floor((new Date() - elapsedTimeStart) / 1000);
            updateElapsedTimeDisplay(seconds);
            elapsedTimeDisplay.style.display = 'block'; // 顯示已用時間
        }, 1000);
    }
});

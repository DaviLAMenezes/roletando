let isRolling = false;
let clickCount = 0;
const adsFrequency = 2; // Configuração: exibe propaganda a cada X cliques (não inclui o primeiro)
const adUrl = "https://toopsoug.net/4/8512631?var={your_source_id}"; // URL da nova propaganda

function handleButtonClick() {
    const button = document.getElementById('rollButton');

    if (clickCount === 0) {
        openAd(); // Abre a propaganda no primeiro clique
        clickCount++;
        return;
    }

    if (button.textContent === "Girar") {
        clickCount++;
        if ((clickCount - 1) % adsFrequency === 0) {
            openAd();
        } else {
            startRoll();
        }
    } else if (button.textContent === "Limpar") {
        resetDigits();
    }
}

function openAd() {
    window.open(adUrl, "_blank"); // Abre a propaganda em uma nova aba
}

function startRoll() {
    if (isRolling) return;

    const button = document.getElementById('rollButton');
    button.disabled = true; // Desativa o botão
    isRolling = true;

    rollNumbers().then(() => {
        button.disabled = false; // Reativa o botão
        button.textContent = "Limpar"; // Troca para 'Limpar'
        isRolling = false;
        showPopup(); // Exibe o pop-up após o sorteio
    });
}

async function rollNumbers() {
    const digits = document.querySelectorAll('.display-digit');
    const totalDuration = 6000; 
    const slowStart = 2500; 
    const stopTimes = [4500, 6000]; 

    const promises = Array.from(digits).map((digit, index) =>
        spinDigit(digit, totalDuration, slowStart, stopTimes[index])
    );

    return Promise.all(promises);
}

function spinDigit(digitElement, totalDuration, slowStart, stopTime) {
    return new Promise((resolve) => {
        let elapsedTime = 0;
        let interval;
        let speed = 150;

        interval = setInterval(() => {
            const randomNumber = Math.floor(Math.random() * 10);
            digitElement.textContent = randomNumber;

            if (elapsedTime >= slowStart) {
                const progress = (elapsedTime - slowStart) / (totalDuration - slowStart);
                speed = Math.max(500, 500 + (speed - 50) * (1 - progress));
            }

            elapsedTime += speed;

            if (elapsedTime >= stopTime) {
                clearInterval(interval);
                digitElement.textContent = Math.floor(Math.random() * 10);
                resolve();
            }
        }, speed);
    });
}

function resetDigits() {
    const digits = document.querySelectorAll('.display-digit');
    digits.forEach(digit => digit.textContent = "0");

    const button = document.getElementById('rollButton');
    button.textContent = "Girar"; 
}

// Função para capturar o IP do usuário
function getUserIp() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            return data.ip || "000.000.000.000"; // Retorna um IP padrão em caso de falha
        })
        .catch(error => {
            console.error('Erro ao obter IP:', error);
            return "000.000.000.000";
        });
}


// Exibe o pop-up com QR Code e resultado
async function showPopup() {
    const digits = Array.from(document.querySelectorAll('.display-digit')).map(digit => digit.textContent).join('');
    const resultMessage = `Número sorteado: ${digits}`;
    document.getElementById('resultMessage').textContent = resultMessage;

    const formattedNumber = digits.split('')
        .map(digit => `${getRandomLetter()}${digit}${getRandomLetter()}`)
        .join('');

    const numberInWords = convertNumberToWords(digits); // Mantém "zero e um"
    const currentTime = new Date().toLocaleString().replace(/[^a-z0-9]/gi, '');
    const userIp = (await getUserIp()).replace(/\./g, ''); // Remove os pontos do IP

    // Montagem do conteúdo do QR Code
    let qrContent = `${currentTime}${digits}${userIp}${numberInWords}${formattedNumber}`;
    qrContent = qrContent.normalize('NFKD').replace(/[^a-zA-Z0-9]/g, ''); // Remove caracteres especiais e espaços

    console.log("QR Content antes da criptografia:", qrContent);

    const encryptedContent = encryptWord(qrContent).replace(/[^a-zA-Z0-9]/g, ''); // Remove caracteres inválidos do criptografado

    console.log("QR Content criptografado:", encryptedContent);

    const qrCodeContainer = document.getElementById('qrCode');
    qrCodeContainer.innerHTML = "";

    QRCode.toCanvas(qrCodeContainer, encryptedContent, { width: 150 }, function (error) {
        if (error) {
            console.error("Erro ao gerar QR Code:", error);
        } else {
            console.log("QR Code gerado com sucesso!");
        }
    });

    document.getElementById('popup').style.display = 'flex';
}


// Converte número para palavras (exemplo básico)
function convertNumberToWords(number) {
    const numberMap = {
        '0': 'zero', '1': 'um', '2': 'dois', '3': 'três', '4': 'quatro',
        '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove'
    };
    // Garante que cada número seja separado por " e "
    return number.split('').map(digit => numberMap[digit]).join(' e ');
}


// Gera uma letra aleatória
function getRandomLetter() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return letters[Math.floor(Math.random() * letters.length)];
}

// Fecha o pop-up
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Compartilha o pop-up como imagem
function sharePopup() {
    const popupContent = document.getElementById('popupContent');
    html2canvas(popupContent).then(canvas => {
        const link = document.createElement('a');
        link.download = 'resultado.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Dicionário de criptografia
const cryptoDictionary = {
    A: { inicio: "3fi0f", meio: "0pq08", final: "7mc09", auth: "04" },
    B: { inicio: "fk31t", meio: "xk7d3", final: "sk4uy", auth: "k2" },
    C: { inicio: "2bl56", meio: "25ah9", final: "2j9n3", auth: "21" },
    D: { inicio: "a7cn8", meio: "ga2ne", final: "2o8nw", auth: "n4" },
    E: { inicio: "wj1cs", meio: "cuc6s", final: "ay9is", auth: "s5" },
    F: { inicio: "0az35", meio: "5wz1y", final: "c0zag", auth: "z3" },
    G: { inicio: "m17jk", meio: "mbk3p", final: "m89ts", auth: "m1" },
    H: { inicio: "v4i4r", meio: "6lihd", final: "dviwe", auth: "i3" },
    I: { inicio: "cqa3f", meio: "fi435", final: "3lt3r", auth: "34" },
    J: { inicio: "raeox", meio: "qalhb", final: "xawvj", auth: "a2" },
    K: { inicio: "1dm6p", meio: "1swwu", final: "1onvu", auth: "11" },
    L: { inicio: "o49wa", meio: "eo7wb", final: "b2ywp", auth: "w4" },
    M: { inicio: "ebdt0", meio: "bhdlK", final: "rxd08", auth: "d3" },
    N: { inicio: "z79hy", meio: "h2fty", final: "xu6ly", auth: "y5" },
    O: { inicio: "g8qjp", meio: "pvxjx", final: "zz0j3", auth: "j4" },
    P: { inicio: "5oiqv", meio: "5y861", final: "50ggq", auth: "51" },
    Q: { inicio: "vzoyk", meio: "leo5i", final: "anomg", auth: "o3" },
    R: { inicio: "mzm74", meio: "izcpb", final: "hznxz", auth: "z2" },
    S: { inicio: "6ebyr", meio: "6rn4f", final: "6erft", auth: "61" },
    T: { inicio: "ygl49", meio: "sbl08", final: "9pl4i", auth: "l3" },
    U: { inicio: "fu7kv", meio: "hc21v", final: "2qitv", auth: "v5" },
    V: { inicio: "dx1zu", meio: "nxd3s", final: "kx9x1", auth: "x2" },
    X: { inicio: "mcwdp", meio: "k87rp", final: "xuupp", auth: "p5" },
    W: { inicio: "yorge", meio: "0o1ap", final: "3o9wz", auth: "o2" },
    Y: { inicio: "orlmn", meio: "qr301", final: "3r491", auth: "r2" },
    Z: { inicio: "pb1aq", meio: "00pzq", final: "qhomq", auth: "q5" },
    "0": { inicio: "7ksfg", meio: "65s47", final: "x1s4e", auth: "s3" },
    "1": { inicio: "tzwxu", meio: "t937f", final: "trecs", auth: "t1" },
    "2": { inicio: "wxxo7", meio: "fsef7", final: "007a7", auth: "75" },
    "3": { inicio: "yhfac", meio: "ghhg3", final: "6h23a", auth: "h2" },
    "4": { inicio: "tt2uy", meio: "de2da", final: "q92jd", auth: "23" },
    "5": { inicio: "yyl8n", meio: "urlan", final: "d4rln", auth: "n5" },
    "6": { inicio: "92b6v", meio: "oa061", final: "des6v", auth: "64" },
    "7": { inicio: "9ttjs", meio: "98fad", final: "9487g", auth: "91" },
    "8": { inicio: "qen92", meio: "mex2k", final: "3eb72", auth: "e2" },
    "9": { inicio: "s8ddx", meio: "574de", final: "ln4dq", auth: "d4" }
};

// Função de criptografia
function encryptWord(word) {
    let encryptedWord = "";
    for (let i = 0; i < word.length; i++) {
        const char = word[i].toUpperCase();
        const crypto = cryptoDictionary[char] || {};
        let positionType = i === 0 ? "inicio" : i === word.length - 1 ? "final" : "meio";
        encryptedWord += crypto[positionType] || char;
    }
    return encryptedWord;
}
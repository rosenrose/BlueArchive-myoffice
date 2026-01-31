const cardCnt = 29;
const seasonStartDate = new Date("2025-12-16");
const seasonEndDate = new Date("2026-03-10");
const precision = 10;

document.querySelector("#seasonStartDate").textContent = toDateString(seasonStartDate);
document.querySelector("#seasonEndDate").textContent = toDateString(seasonEndDate);
const pickCnt = getPickCnt(seasonStartDate, seasonEndDate);

document.querySelector("#cardCnt").textContent = cardCnt;
document.querySelector("#pickCnt").textContent = pickCnt;
document.querySelector("#probability").textContent = `${getPercent(calcProbability(cardCnt, pickCnt))}%`;

const today = new Date();
const userStartDateInput = document.querySelector("#userStartDate");
userStartDateInput.value = today.toISOString().slice(0, 10);

const userEndDateInput = document.querySelector("#userEndDate");
userEndDateInput.value = seasonEndDate.toISOString().slice(0, 10);

for (const userDateInput of [userStartDateInput, userEndDateInput]) {
    userDateInput.min = seasonStartDate.toISOString().slice(0, 10);
    userDateInput.addEventListener("change", updateUserInput);
}

const cardContainer = document.querySelector("#cardContainer");
const cardTemplate = document.querySelector("#cardTemplate");

for (let i = 0; i < cardCnt; i++) {
    const template = cardTemplate.content.cloneNode(true);
    const img = template.querySelector("img");

    img.src = `./pre_season/${(i + 1).toString().padStart(3, "0")}.png`;
    cardContainer.append(template);
}

cardContainer.addEventListener("change", updateUserInput);
updateUserInput();


function sum(nums, init = 0n) {
    return nums.reduce((acc, num) => acc + num, init);
}

function prod(nums, init = 1n) {
    return nums.reduce((acc, num) => acc * num, init);
}

function combiCnt(n, r) {
    r = Math.min(r, n - r);
    const range = [...Array(r).keys()];

    return prod(range.map(i => BigInt(n - i))) / prod(range.map(i => BigInt(r - i)));
}

function calcProbability(cardCnt, pickCnt, targetCnt = cardCnt) {
    if (targetCnt == 0) {
        return 0;
    }

    const total = BigInt(cardCnt) ** BigInt(pickCnt);
    const complementary = sum([...Array(targetCnt).keys()].map(i => (
        combiCnt(targetCnt, i + 1) * (BigInt(cardCnt - (i + 1)) ** BigInt(pickCnt)) * (i & 1 ? -1n : 1n))
    ));
    const pow = 10 ** precision;

    return Number((total - complementary) * BigInt(pow) / total) / pow;
}

function getPercent(probability) {
    return (probability * 100).toString().slice(0, precision + 1);
}

function toDateString(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDateDiff(startDate, endDate) {
    return Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1;
}

function getPickCnt(startDate, endDate, pickPerDay = 2) {
    return getDateDiff(startDate, endDate) * pickPerDay;
}

function updateUserInput() {
    let userStartDate = new Date(userStartDateInput.value);
    let userEndDate = new Date(userEndDateInput.value);

    if (userStartDate > userEndDate) {
        userStartDate = userEndDate;
        userStartDateInput.value = userStartDate.toISOString().slice(0, 10);
    }

    if (userEndDate < userStartDate) {
        userEndDate = userStartDate;
        userEndDateInput.value = userEndDate.toISOString().slice(0, 10);
    }

    userStartDateInput.max = userEndDateInput.value;
    userEndDateInput.min = userStartDateInput.value;

    const userPickCnt = getPickCnt(userStartDate, userEndDate);
    document.querySelector("#userPickCnt").textContent = userPickCnt;

    const userCardCnt = cardContainer.querySelectorAll("input:checked").length;
    document.querySelector("#userCardCnt").textContent = userCardCnt;
    document.querySelector("#userProbability").textContent = `${getPercent(calcProbability(cardCnt, userPickCnt, userCardCnt))}%`;
}

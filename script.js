let data = [
  {
    ask: "Đâu là nhà sản xuất ô tô đến từ Mỹ?",
    answer: "Ford",
    choices: ["Ford", "BMW", "Mercedes", "Audi"],
  },
  {
    ask: "Hoàng Sa, Trường Sa là của...?",
    answer: "Việt Nam",
    choices: ["Việt Nam", "Trung Quốc", "Indonesia", "Philippines"],
  },
  {
    ask: "Đâu là một loài động vật họ mèo",
    answer: "Hổ",
    choices: ["Hổ", "Cáo", "Cá sấu", "Linh dương"],
  },
  {
    ask: "Số pi có giá trị là?",
    answer: "3.14",
    choices: ["3.14", "4.13", "1.34", "3.41"],
  },
  {
    ask: "Đâu là thủ đô của nước Việt Nam",
    answer: "Hà Nội",
    choices: ["Hà Nội", "Quảng Ninh", "TP. Hồ Chí Minh", "Đà Nẵng"],
  },
];

// Shuffle thứ tự các lựa chọn trong mảng choices
for (let i = 0; i < data.length; i++) {
  data[i].choices.sort(() => Math.random() - 0.5);
}

// Shuffle thứ tự câu hỏi trong mảng data
data.sort(() => Math.random() - 0.5);

// Câu hỏi hiện tại (current question)
let curQuestion = 0;

// Function render ra từng câu hỏi

function renderQuestion(count) {
  // Lấy ra câu hỏi hiện tại
  let question = data[count];

  // Cập nhật title, nội dung câu hỏi
  $(".question-title").html(`Câu hỏi ${count + 1}/${data.length}`);

  $(".question-content").html(`${question.ask}`);

  // Cập nhật các lựa chọn cho câu hỏi
  $(".choices-box")[0].innerHTML = "";

  for (let i = 0; i < question.choices.length; i++) {
    $(".choices-box")[0].innerHTML += `<div
                class="choice border"
                id="choice-${count + 1}"
                onclick="checkResult(this)"
              >
                <p>${question.choices[i]}</p>
                <i class="fas fa-check-circle hide"></i>
               <i class="fas fa-times-circle hide"></i>
              </div>
               `;
  }

  // Xử lý khi ở câu hỏi cuối: Nút "Câu tiếp theo" thành nút "Kết thúc"
  if (count == data.length - 1) {
    $(".btn-next").addClass("hide");
    $(".btn-submit").removeClass("hide");
  }

  // Cập nhật thanh tiến trình
  $(".progress-bar").css("width", `${((count + 1) / data.length) * 100}%`);
}

renderQuestion(curQuestion);

// Biến kiểm tra nếu người dùng trả lời mới cho next, và không cho phép chọn lại đáp án (mặc định flag = false là chưa cho next và cho chọn đáp án)
let allowNext = false;

// Lắng nghe sự kiện nút "Câu hỏi tiếp"
$(".btn-next").on("click", () => {
  // Tăng câu hỏi lên 1, nếu là câu hỏi cuối cùng thì không tăng lên nữa
  if (curQuestion < data.length) {
    if (allowNext) {
      curQuestion++;
      if (curQuestion > data.length - 1) {
        curQuestion = data.length - 1;
      }
      renderQuestion(curQuestion);
      allowNext = false;
    }
  }
});

// Check và show kết quả đúng sai cho từng câu hỏi, cập nhật diamond

let userCorrect = 0;
let points = 0;

function checkResult(choice) {
  if (!allowNext) {
    if (choice.firstElementChild.innerText == data[curQuestion].answer) {
      points += 100;
      userCorrect++;

      choice.querySelector(".fa-check-circle").classList.remove("hide");
      choice.classList.add("right-selected");
      $(".right-sound").get(0).play();
    } else {
      points -= 50;

      choice.querySelector(".fa-times-circle").classList.remove("hide");
      choice.classList.add("wrong-selected");
      $(".wrong-sound").get(0).play();
    }

    choice.firstElementChild.style.opacity = "1";
    choice.firstElementChild.classList.remove("hint-choice");

    // Sau khi chọn đáp án thì cho phép next sang câu tiếp
    allowNext = true;

    // Cập nhật diamond
    $(".points").html(`${points}`);
  }
}

// Sau khi trả lời hết, người dùng ấn nút "Kết thúc"
$(".btn-submit").on("click", () => {
  $(".end-game").removeClass("hide");
  $(".quiz").addClass("hide");

  // Cập nhật nội dung khi game end
  renderGameEnd();
});

// Hiển thị nội dung khi game end
function renderGameEnd() {
  if (userCorrect == data.length) {
    $(".end-title").html("Thật xuất sắc !");
    $(".end-result").html(`Bạn đã trả lời đúng tất cả các câu hỏi.`);
    $(".winner-sound").get(0).play();
  } else if (userCorrect == 0) {
    $(".end-result").html(`Bạn không trả lời được câu hỏi nào.`);
    $(".end-sound").get(0).play();
  } else {
    $(".end-result").html(
      `Bạn đã trả lời đúng ${userCorrect}/${data.length} câu hỏi.`
    );
    $(".end-sound").get(0).play();
  }
}

// Countdown thời gian chơi game
let time = 50;
let interval = setInterval(countDown, 1000);

function countDown() {
  time--;
  $(".time").html(`${time}s`);

  if (time <= 5) {
    $(".time").css("color", "#ffd000");
  } else {
    $(".time").css("color", "#fff");
  }

  if (time == 0) {
    clearInterval(interval);

    $(".end-game").removeClass("hide");
    $(".quiz").addClass("hide");
    $(".end-title").html("Hết giờ !");
    $(".loser-sound").get(0).play();
  }
}

// Gán sự kiện cho nút "Chơi lại"
$(".play-again").on("click", () => {
  window.location.reload();
});

// Gán sự kiện cho nút 50:50: loại bỏ 2 đáp án sai, nút 50:50 chỉ được sử dụng 1 lần
let allowHint = true;

$(".hint").on("click", hint);

function hint() {
  if (allowHint) {
    // Loại bỏ đáp án đúng trong mảng choices của câu hỏi hiện tại
    let curChoices = data[curQuestion].choices;
    curChoices.forEach((item, index) => {
      if (item == data[curQuestion].answer) {
        curChoices.splice(index, 1);
      }
    });

    // Chọn ngẫu nhiên 2 đáp án sai trong mảng choices (mảng đã được loại bỏ đáp án đúng)
    curChoices.sort(() => Math.random() - 0.5);
    let firstHint = curChoices[0];
    let secondHint = curChoices[1];

    // Khi người dùng bấm nút 50:50, thêm hiệu ứng cho 2 đáp án sai
    let list = document.querySelectorAll(".choice p");
    Array.from(list).forEach((item) => {
      if (item.innerText == firstHint || item.innerText == secondHint) {
        item.classList.add("hint-choice");
        // document.querySelector(".hint-sound").play();
        $(".hint-sound").get(0).play();
      }
    });

    // Disable nút 50:50
    allowHint = false;
    $(".hint").addClass("disable");
  }
}

(() => {
  const $blocks = document.querySelectorAll(".main__td-counter"), // блоки с ползунками
        $btnAdd = document.querySelector(".main__day-off-btn"), // кнопка добавления дат
        $btnClearDaysOff = document.querySelector(".main__clear-days-off-list"), // кнопка очистки списка выходных дней
        $resultBlock = document.querySelector('.result'); // блок результатов

  let daysOff = []; // массив выходных дней

  $resultBlock.classList.add('active'); // скрытие блока расписания

  // изменение счетчика
  function setCounter() {
    for (const $block of $blocks) {
      const $input = $block.querySelector(".main__day-count");
      const $counter = $block.querySelector(".main__counter");

      $counter.textContent = $input.value;

      $input.addEventListener("input", () => {
        $counter.textContent = $input.value;
      });
    }
  }

  $btnAdd.addEventListener("click", function (e) {
    e.preventDefault();

    // добавление дат
    let dateInputValue = document.querySelector(".main__day-off-picker").value;

    if (!dateInputValue) {
      return;
    }

    dateInputValue = new Date(dateInputValue).toLocaleDateString("ru-RU");

    if (!daysOff.includes(dateInputValue)) {
      daysOff.push(dateInputValue);
      renderDates();
    }
  });

  // Функция для удаления даты из массива
  function removeDate(date) {
    const index = daysOff.indexOf(date);
    if (index !== -1) {
      daysOff.splice(index, 1);
      renderDates();
    }
  }

  // Функция для перерисовки списка дат на странице
  function renderDates() {
    const datesList = document.querySelector(".main__days-off-list");

    // Очистка списка
    while (datesList.firstChild) {
      datesList.removeChild(datesList.firstChild);
    }

    // Создание элементов списка для каждой даты
    daysOff.forEach(function (date) {
      const listItem = document.createElement("li");
      const datePar = document.createElement("p");
      datePar.textContent = date;
      datePar.className = "main__day-off-text";

      // Создание кнопки удаления даты
      const deleteButton = document.createElement("button");
      deleteButton.className = "main__delete-day-btn";
      deleteButton.innerHTML = `<img class="main__delete-day-icon" src="img/delete-icon.svg" alt="Удалить" />`;

      // Назначение обработчика события для кнопки удаления
      deleteButton.addEventListener("click", function () {
        removeDate(date);
      });

      listItem.appendChild(datePar);
      listItem.appendChild(deleteButton);
      datesList.appendChild(listItem);
    });
  }

  // очистка списка выходных дней
  $btnClearDaysOff.addEventListener("click", function (e) {
    e.preventDefault();

    daysOff = [];

    renderDates();
  });

  const form = document.querySelector(".main__make-schedule-btn"); // форма
  const resetBtn = document.querySelector('.main__make-schedule-btn_reset'); // кнопка ресета
  resetBtn.style = 'display: none';

  // перезагрузка страницы с очисткой кеша
  resetBtn.addEventListener('click', function(e) {
    e.preventDefault();

    location.reload(true);
  })

  form.addEventListener("click", function (e) {
    e.preventDefault();

    const weeks = readWeeks();
    const beginOfSemester = getStartSemester();
    const endOfSemester = getEndSemester();
    const weekInfo = getWeekInfo();
    const hours = getHours();

    // обработка ошибок
    const weeksError = document.querySelector('.main__data-count-of-subjects-error');
    const beginOfSemesterError = document.querySelector('.main__data-date-of-begin-error');
    const endOfSemesterError = document.querySelector('.main__data-date-of-end-error');
    const hoursError = document.querySelector('.main__data-count-of-hours-error');
    const weekInfoError = document.querySelector('.main__data-week-type-error');

    weeksError.classList.remove('active');
    beginOfSemesterError.classList.remove('active');
    endOfSemesterError.classList.remove('active');
    hoursError.classList.remove('active');
    weekInfoError.classList.remove('active');

    if (!checkObjectValues(weeks)) {
      weeksError.classList.add('active');
    }

    if (!beginOfSemester) {
      beginOfSemesterError.classList.add('active');
    }

    if (!endOfSemester) {
      endOfSemesterError.classList.add('active');
    }

    if (!hours) {
      hoursError.classList.add('active');
    }

    if (!weekInfo) {
      weekInfoError.classList.add('active');
    }

    if (!checkObjectValues(weeks)
        || !beginOfSemester
        || !endOfSemester
        || !hours
        || !weekInfo) {
          return;
        }

    // ------------------------------------------------------------------------

    const begin = new Date(beginOfSemester);
    const end = new Date(endOfSemester);

    if (begin >= end) {
      alert(
        "Дата конца семестра не должна совпадать или быть меньше даты начала семестра!"
      );
      return;
    }

    const schedule = generateSchedule(
      weeks,
      beginOfSemester,
      endOfSemester,
      weekInfo
    );

    if (
        weeks
        && beginOfSemester
        && endOfSemester
        && weekInfo
        && hours
    ) {
      form.style = 'display: none';
      resetBtn.style = 'display: block';
    }

    checkHours(hours, schedule);
  });

  // валидация недель
  function checkObjectValues(obj) {
    // Проверяем каждое значение в объекте
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] !== 0) {
          return true; // Если хотя бы одно значение отличается от 0, возвращаем true
        }
      }
    }
  
    return false; // Если все значения равны 0, возвращаем false
  }

  // составление расписания
  function readWeeks() {
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const data = {};

    daysOfWeek.forEach((day) => {
      data[`upper${day.charAt(0).toUpperCase()}${day.slice(1)}`] =
        parseInt(document.querySelector(`input[name='upper-${day}']`).value);
      data[`lower${day.charAt(0).toUpperCase()}${day.slice(1)}`] =
        parseInt(document.querySelector(`input[name='lower-${day}']`).value);
    });

    return data;
  }

  // дата начала семестра
  function getStartSemester() {
    const inputValue = document.querySelector(".main__date-picker_start").value;

    return inputValue;
  }

  // дата окончания семестра
  function getEndSemester() {
    const inputValue = document.querySelector(".main__date-picker_end").value;

    return inputValue;
  }

  // количество часов
  function getHours() {
    const inputValue = document.querySelector(".main__hours").value;

    return inputValue;
  }

  function getWeekInfo() {
    const radioValue = document.querySelector(
      'input[name="week"]:checked'
    );

    if (radioValue === null) {
      return null;
    }

    return radioValue.value;
  }

  // генерация расписания
  function generateSchedule(
    weeks,
    beginOfSemester,
    endOfSemester,
    weekInfo,
  ) {
    const startDate = new Date(beginOfSemester);
    const endDate = new Date(endOfSemester);
    let schedule = [];

    // Определение начального типа недели
    let currentWeekType = weekInfo === "upper" ? "upper" : "lower";

    // Перебор дат от начала до конца семестра
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const month = currentDate.toLocaleString("default", { month: "long" });
      const fullDate = currentDate.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const dayOfWeek = currentDate.toLocaleDateString("ru-RU", {
        weekday: "long",
      });

      const dayOfWeekEng = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      const weekType = weeks[currentWeekType + dayOfWeekEng];

      if (Number(weekType) !== 0 && !daysOff.includes(fullDate)) {
        const formattedDate = {
          fullDate,
          dayOfWeek,
          weekType: Number(weekType),
          currentWeekType: currentWeekType === "upper" ? "верхняя" : "нижняя",
        };

        if (schedule.hasOwnProperty(month)) {
          schedule[month].push(formattedDate);
        } else {
          schedule[month] = [formattedDate];
        }
      }

      // Смена типа недели каждую неделю
      if (dayOfWeekEng === "Sunday") {
        currentWeekType = currentWeekType === "upper" ? "lower" : "upper";
      }
    }
    
    return schedule;
  }

  // функция проверки часов в расписании и обновления его при необходимости
  function checkHours(hours, schedule) {
    let hoursOfClasses = 0;
    const messageDiv = document.querySelector(".schedule__error");
    messageDiv.textContent = "";

    for (const month in schedule) {
      const monthSchedule = schedule[month];
      monthSchedule.forEach((item) => {
        hoursOfClasses += item.weekType * 2;
      });
    }

    if (hours < hoursOfClasses) {
      let updatedSchedule = {};

      for (const month in schedule) {
        const monthSchedule = schedule[month];
        let updatedMonthSchedule = [];

        for (const item of monthSchedule) {
          if (hours >= (item.weekType * 2)) {
            updatedMonthSchedule.push(item);
            hours -= item.weekType * 2;
          } else if (hours > 0) {
            const updatedItem = { ...item, weekType: Math.ceil(hours / 2) };
            updatedMonthSchedule.push(updatedItem);
            hours = 0;
          } else {
            break;
          }
        }

        updatedSchedule[month] = updatedMonthSchedule;
      }

      const lastDay = findLastFullDate(updatedSchedule);
      updatedSchedule = removeEmptyArrays(updatedSchedule);

      renderUpdatedSchedule(updatedSchedule);
      messageDiv.innerHTML =
        `Часы дисциплины были исчерпаны до окончания семестра.<br/>Дата последнего занятия: ${lastDay}`;
    } else if (hours > hoursOfClasses) {
      const difference = Math.ceil((hours - hoursOfClasses) / 2);

      renderUpdatedSchedule(schedule);

      messageDiv.innerHTML =
        `Выбранный диапазон дат не обеспечивает заданную продолжительность в часах.<br/>Пожалуйста, укажите пары: ${difference}`;
    } else {
      renderUpdatedSchedule(schedule);

      messageDiv.textContent =
        "Количество часов в расписании соответствует заданному количеству часов.";
    }
  }

  // поиск последней даты
  function findLastFullDate(months) {
    const monthKeys = Object.keys(months);
    const lastMonthKey = monthKeys[monthKeys.length - 1];
  
    const lastMonth = months[lastMonthKey];
    if (lastMonth.length > 0) {
      const lastItem = lastMonth[lastMonth.length - 1];
      const lastFullDate = lastItem.fullDate;
      return lastFullDate;
    } else {
      // Если последний месяц пустой, ищем последний заполненный fullDate в предыдущих месяцах
      for (let i = monthKeys.length - 2; i >= 0; i--) {
        const monthKey = monthKeys[i];
        const month = months[monthKey];
        if (month.length > 0) {
          const lastItem = month[month.length - 1];
          const lastFullDate = lastItem.fullDate;
          return lastFullDate;
        }
      }
    }
  
    return null;
  }

  // очистка пустых месяцев
  function removeEmptyArrays(months) {
    const result = {};
    
    for (const month in months) {
      if (Object.prototype.hasOwnProperty.call(months, month) && months[month].length !== 0) {
        result[month] = months[month];
      }
    }
    
    return result;
  }

  function renderUpdatedSchedule(schedule) {
    const scheduleTbody = document.querySelector('.schedule__tbody');

    $resultBlock.classList.remove('active'); // показ блока расписания

    // Очистка расписания
    while (scheduleTbody.firstChild) {
      scheduleTbody.removeChild(scheduleTbody.firstChild);
    }

    // Создание элементов для отображения расписания
    for (const month in schedule) {
      const monthSchedule = schedule[month];

      monthSchedule.forEach((item) => {
        const scheduleTr = document.createElement('tr');
        scheduleTr.className = 'schedule__tr';
        
        const scheduleMonthTd = document.createElement('td');
        scheduleMonthTd.className = 'schedule__td';
        const scheduleDateTd = document.createElement('td');
        const scheduleDayTypeTd = document.createElement('td');
        const scheduleCountClassesTd = document.createElement('td');
        const scheduleWeekTypeTd = document.createElement('td');
        
        scheduleDateTd.className =
        scheduleDayTypeTd.className =
        scheduleCountClassesTd.className =
        scheduleWeekTypeTd.className = "schedule__item-td";

        scheduleMonthTd.textContent = month;
        scheduleDateTd.textContent = item.fullDate;
        scheduleDayTypeTd.textContent = item.dayOfWeek;
        scheduleCountClassesTd.textContent = item.weekType;
        scheduleWeekTypeTd.textContent = item.currentWeekType;
        
        scheduleTr.append(scheduleMonthTd);
        scheduleTr.append(scheduleDateTd);
        scheduleTr.append(scheduleDayTypeTd);
        scheduleTr.append(scheduleCountClassesTd);
        scheduleTr.append(scheduleWeekTypeTd);

        scheduleTbody.append(scheduleTr);
      });
    }
  }

  setCounter();
  renderDates();
})();

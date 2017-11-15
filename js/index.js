/*
See https://www.greensock.com/draggable/ for details.
This demo uses ThrowPropsPlugin which is a membership benefit of Club GreenSock, https://www.greensock.com/club/
*/
const mainBlock = document.querySelector('.main');

var $container = $(".container"),
    droppables = $(".box"),
    gridWidth = 55,
	gridHeight = 55,
	gridRows = 6,
	gridColumns = 6,
	i, x, y,
	x_plus = 0,
	y_plus = 0,
    x_cell_start,
    y_cell_start,
    arrayOfBlockObj = [],   // Объекты, где хранятся блоки, их начальные позиции (перед каждым их перемещением). Нужно для обработки кнопки back, reload
    currentLevel = localStorage.getItem('current_level'); // Значение текущего уровня, полученное из локального хранилища


// Создаем сетку, по которой движутся элементы
for (i = 0; i < gridRows * gridColumns; i++) {
	if (i % 6 == 0 && i != 0) {
		y_plus = y_plus + 2;
		x_plus = 0;
	}
	y = Math.floor(i / gridColumns) * gridHeight + y_plus;
	x = (i * gridWidth) % (gridColumns * gridWidth) + x_plus;

	if (i == 17) {
        $('<div/>', {'class': 'grid'}).css({position: "absolute", width: gridWidth + 20, height: gridHeight, top: y, left: x}).prependTo($container);
    }
	else {
        $('<div/>', {'class': 'grid'}).css({position: "absolute", width: gridWidth, height: gridHeight, top: y, left: x}).prependTo($container);
    }
	x_plus = x_plus + 2;
}

// Создаем контейнер и блоки, где v-vertical, h-horizontal, число- размер блока
TweenLite.set($container, {height: gridRows * gridHeight + 10, width: gridColumns * gridWidth + 10});
TweenLite.set(".box-v2", {width:gridWidth, height:2*gridHeight+2});
TweenLite.set(".box-v3", {width:gridWidth, height:3*gridHeight+4, lineHeight:gridHeight + "px"});
TweenLite.set(".box-h2", {width:2*gridWidth+2, height:gridHeight, lineHeight:gridHeight + "px"});
TweenLite.set(".box-h3", {width:3*gridWidth+4, height:gridHeight, lineHeight:gridHeight + "px"});

// Лучший результат. Если его нет, то мы создаем best_moves и кладем туда 0. Выставляем счетчик
var bestMoves = localStorage.getItem('best_moves_' + currentLevel);
if (bestMoves == null) {
    localStorage.setItem('best_moves_' + currentLevel, 0);
    var bestMovesCount = document.getElementById("bestMoves");
    bestMovesCount.innerHTML = parseInt(localStorage.getItem('best_moves_' + currentLevel));
} else {
    var bestMovesCount = document.getElementById("bestMoves");
    bestMovesCount.innerHTML = parseInt(localStorage.getItem('best_moves_' + currentLevel));
}

// Если игра еще не запускалась, то создаем в локальном хранилище 'unlocked_levels' и разблокируем 2 уровня
var unlock = localStorage.getItem('unlocked_levels');
if (unlock == null) {
    localStorage.setItem('unlocked_levels', 2);
}

// Задаются опции передвижения 
function update() {

    Draggable.create(".box-h", {
        bounds:$container,
        type:"x",
        edgeResistance:0.85,
        onPress: onPress,
		onRelease: onRelease,
        onDrag: onDrag
    });
    
    Draggable.create(".box-v", {
        bounds: $container,
        type: "y",
        edgeResistance: 0.85,
        onPress: onPress,
        onRelease: onRelease,
        onDrag: onDrag
    });
}
// Столкновения
function onDrag() {
    // TO DO, bug, столкновение
    var i = droppables.length;
    while (--i > -1) {
        if (this.hitTest(droppables[i], 0)) {
            this.endDrag();
        }
    }
}

// Получаю ячейки по Х и У на старте
function onPress() {
    x_cell_start = Math.round(this.target._gsTransform.x / gridWidth);
    y_cell_start = Math.round(this.target._gsTransform.y / gridWidth);
}

// Функция, срабатывающая после отпускания блока
function onRelease() {

    // Если главный блок оказался в 4й(отсчет от 0) клетке, то уровень пройден
    var mainCell = Math.round(mainBlock._gsTransform.x / gridWidth)
    if (mainCell == 4) {
         //alert('win');
        this.endDrag();
        TweenLite.to(mainBlock, 2, {x: 500})

        // Сохраняем лучший результат
        bestMovesFunc();

        // Разблокируем следующие 2 уровня
        unlockLevelFunc();

        // Переход на следующий уровень c задержкой
        setTimeout(nextLevel, 1500)

    } else{ //Магнитим по сеткe
        magnetTheEdge(this.target);
    }
    // Счетчик
    counter(this.target);

    // TO DO Ждем 0.5 секунды, пока все блоки втсанут на места и потом проверяем, есть ли накладывания, если да, то отбрасываем на соседнюю клетку
    //setTimeout(correctPos(this.target), 500);
}

// Определение лучшего результата. Получаю значение текущего числа движений, сверяю с текущим лучшим результатом
function bestMovesFunc() {
    var curMoves = +document.getElementById("moves").innerText + 1;
    var curBestMoves = parseInt(localStorage.getItem('best_moves_' + currentLevel));

    // Если текущий лучший результат "0", то текущий результат прохождения и есть лучшим
    if ( (curMoves < curBestMoves && curBestMoves != 0 ) || curBestMoves == 0) {
        localStorage.setItem('best_moves_' + currentLevel, parseInt(curMoves) );
    }

}

// Разблокируем 2 уровня после текущего
function unlockLevelFunc() {
    var unlockedLevels = +currentLevel + 2;
    localStorage.setItem('unlocked_levels', unlockedLevels);
    alert(localStorage.getItem('unlocked_levels'))
}

// Переход на следующий уровень, вношу в локальное хранилище номер следующего уровня, который нужно загрузить и перезагружаю страницу
function nextLevel() {
    var numNextLevel = parseInt(localStorage.getItem('current_level')) + 1;
    localStorage.setItem('current_level', numNextLevel);
    location.reload()
}

/*function correctPos(element) {
    var i = droppables.length;
    while (--i > -1) {
        if (element.hitTest(droppables[i], 0)) {
            TweenLite.to(element, 0.5, {
                x: x_cell_start * gridWidth + x_cell_start * 2,
                y: y_cell_start * gridWidth + y_cell_start * 2,
            })
        }
    }
}*/
function magnetTheEdge(element) {
    TweenLite.to(element, 0.5, {
        x:Math.round(element._gsTransform.x / gridWidth) * gridWidth + Math.round(element._gsTransform.x / gridWidth) * 2,
        y:Math.round(element._gsTransform.y / gridHeight) * gridHeight + Math.round(element._gsTransform.y / gridHeight) * 2,
        delay:0.1,
        ease:Power1.easeInOut
    });
}

// Получаю ячейки по Х и У после отпускания, сравниваю с начальными
function counter(element) {
    var x_cell_finish = Math.round(element._gsTransform.x / gridWidth);
    var y_cell_finish = Math.round(element._gsTransform.y / gridWidth);

    if (x_cell_start != x_cell_finish || y_cell_start != y_cell_finish) {
        // Изменение счетчика в HTML
        var count = document.getElementById("moves");
        count.innerHTML = +count.innerHTML + 1;

        // Если произошел сдвиг, то создаю объект, добавляю его в массив
        makeTheObj(element);
    }
}

// Создание объекта, добавление в массив
function makeTheObj(element) {
    var blockObj = {
        block : element,
        x_cell : x_cell_start,
        y_cell : y_cell_start
    };

    arrayOfBlockObj.push(blockObj);
}

// Обработка кнопки Back/Restart
function back_restart(rest) {
    // Если нажата кнопка Back, то возвращаемся на 1 позицию, если Restart, то до опустошения массива
    var times;
    if (rest) {
        times = arrayOfBlockObj.length;
    } else {
        times = 1;
    }

    var j = 0;

    // Второе условие для предотвращения ошибки удаления несуществующего элемента массива
    while ((j < times) && (arrayOfBlockObj.length >= 1)) {
        var last_block = arrayOfBlockObj[arrayOfBlockObj.length - 1].block;
        var x_cell_block = arrayOfBlockObj[arrayOfBlockObj.length - 1].x_cell;
        var y_cell_block = arrayOfBlockObj[arrayOfBlockObj.length - 1].y_cell;

        TweenLite.to(last_block, 1, {
            x: x_cell_block * gridWidth + x_cell_block * 2,
            y: y_cell_block * gridHeight + y_cell_block * 2
        });

        arrayOfBlockObj.pop();

        // Уменьшаем счетчик на 1
        var count = document.getElementById("moves");
        count.innerHTML = +count.innerHTML - 1;

        j++;
    }
}

// Записывает в 'current_level' номер уровня, выбранного в меню
function changeLevel(numLevel) {
    localStorage.setItem('current_level', numLevel);
}

// Для удаления хранящихся данных
function reset() {
    localStorage.clear()
}

update();
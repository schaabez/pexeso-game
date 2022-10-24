function shuffleArray(array) {
	console.log(array.length);
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];

		array[i] = array[j];
		array[j] = temp;
	}

	console.log(array.length);
	return array;
}

class App {

	awaiting = 0;

	highScore = 0;
	currentScore = 0;

	firstMatch = null;
	secondMatch = null;

	pieces = [];
	matches = [];

	constructor(selector) {
		this.game = document.querySelector(selector);

		this.prepareLayout();
	}

	prepareLayout() {

		let highScoreDiv = document.createElement('div');
		let currentScoreDiv = document.createElement('div');

		this.highScoreEl = document.createElement('span');
		this.highScoreEl.innerText = this.highScore;

		this.currentScoreEl = document.createElement('span');
		this.currentScoreEl.innerText = this.currentScore;

		highScoreDiv.append('Nevyšší score:');
		highScoreDiv.append(this.highScoreEl);

		currentScoreDiv.append('Score:');
		currentScoreDiv.append(this.currentScoreEl);

		this.gameOptions = document.createElement('div');
		this.gameOptions.className = 'game-options';

		this.gameOptions.append(currentScoreDiv);
		this.gameOptions.append(highScoreDiv);

		this.gameContent = document.createElement('div');
		this.gameContent.className = 'game-content';

		this.game.append(this.gameOptions);
		this.game.append(this.gameContent);
	}

	init() {
		this.gridSize = this.askForSize();
		this.generateGrid();
		this.render();
	}

	updateStats() {
		this.highScore = Math.max(this.currentScore, this.highScore);
	}

	updateUI() {
		this.highScoreEl.innerText = this.highScore;
		this.currentScoreEl.innerText = this.currentScore;
	}

	render() {
		let piecesToRender = [];

		for (let i = 0; i < this.possiblePairs; i++) {
			for (let j = 0; j < 2; j++) {
				piecesToRender.push({
					'index': i,
					'element': this.createPiece()
				});
			}
		}

		shuffleArray(piecesToRender);

		for (let i = 0; i < piecesToRender.length; i++) {
			let el = piecesToRender[i];
			this.matches[i] = el.index;
			el.element.dataset.position = i;
			this.gameContent.append(el.element);
		}

		let that = this;
		this.gameContent.querySelectorAll('.piece').forEach((e) => {
			e.addEventListener('click', function () {
				if (that.firstMatch === null || that.firstMatch === e) {
					that.firstMatch = e;
				} else {
					that.secondMatch = e;
				}
				that.update();
			});
		});

		this.gameContent.classList.add('show');
	}

	update() {
		[this.firstMatch, this.secondMatch].forEach((e) => {
			if (e && !e.querySelector('img')) {
				let image = this.getImage(e.dataset.position);
				e.classList.add('show-image');
				e.append(image);
			}
		});

		if (this.firstMatch && this.secondMatch) {
			let firstPosition = this.firstMatch.dataset.position;
			let secondPosition = this.secondMatch.dataset.position;

			if (this.matches[firstPosition] === this.matches[secondPosition]) {
				[this.firstMatch, this.secondMatch].forEach((e) => {
					e.classList.remove('show-image');
					e.classList.add('solved');
				});

				this.currentScore++;
				this.updateStats();

				this.checkGameCondition();
			} else {

				this.currentScore = 0;

				this.waitPiece(this.firstMatch);
				this.waitPiece(this.secondMatch);

				this.resetTurn(this.awaiting);

				this.awaiting++;
			}

			this.firstMatch = null;
			this.secondMatch = null;

			this.updateStats();
			this.updateUI();
		}
	}

	waitPiece(el) {
		el.classList.add('waiting');
		el.dataset.waiting = this.awaiting;
	}

	checkGameCondition() {
		if (this.gameContent.querySelectorAll('.piece:not(.solved)').length === 0) {
			alert('You won!');
		}
	}

	resetTurn(index) {
		let els = this.gameContent.querySelectorAll('[data-waiting="' + index + '"]');
		setTimeout(() => {
			els.forEach((e) => {
				e.querySelector('img').remove();
				e.classList.remove('show-image');
				e.classList.remove('waiting');
			});
		}, 1500);
	}

	generateGrid() {
		let gridSize = this.gridSize.split('x');

		this.cols = Math.min(Math.max(parseInt(gridSize[0]), 2), 10);
		this.rows = Math.min(Math.max(parseInt(gridSize[1]), 2), 10);

		this.gameContent.style.setProperty('--cols', this.cols);
		this.gameContent.style.setProperty('--rows', this.rows);

		this.total = this.rows * this.cols;

		this.possiblePairs = Math.floor(this.total / 2);
	}

	askForSize() {
		let size = null;
		do {
			if (size) {
				alert('Wrong format! Try Again!');
			}
			size = prompt('Define grid size in format WxH of blocks. [min 2x2, max 10x10]');
		} while (!size.match(/^\d+x\d+$/));

		return size;
	};


	getImage(position) {
		let index = this.matches[position];
		let img = document.createElement('img');
		img.src = 'https://picsum.photos/id/' + index + '/64/64';
		img.loading = 'lazy';
		return img;
	}

	createPiece() {
		let element = document.createElement('div');

		element.innerHTML = '<div class="questionMark">?</div>'
		element.classList.add('piece');

		return element;
	}
}
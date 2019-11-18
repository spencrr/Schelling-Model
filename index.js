export default p5 => {
  const frameRate = 10;

  let grid;
  let colors;

  let populationSlider, multSlider, groupSlider, preferenceSlider;
  let populationSpan, multSpan, groupSpan, preferenceSpan;

  const populationSliderOptions = {
    min: 0.15,
    max: 0.95,
    default: 0.8,
    step: 0.01
  };
  const multSliderOptions = {
    min: 3,
    max: 10,
    default: 5,
    step: 1
  };
  const groupSliderOptions = {
    min: 2,
    max: 10,
    default: 2,
    step: 1
  };
  const preferenceSliderOptions = {
    min: 0,
    max: 1,
    default: 0.5,
    step: 0.01
  };

  const initColors = numGroups => {
    const hue = Math.random() * 360;
    const sat = 50;
    const bright = 75;
    const offset = 360 / numGroups;
    p5.colorMode(p5.HSB);
    let colors = [];
    for (let i = 0; i < numGroups; i++) {
      colors.push(p5.color((hue + offset * i) % 360, sat, bright));
    }
    p5.colorMode(p5.RGB);
    return colors;
  };

  let mult_, groups_, pop_, pref_, changed_;

  let resized;

  p5.setup = function setup() {
    let canvas = p5.createCanvas();
    canvas.parent("canvas");
    canvas.addClass("w-100 h-100");
    this.windowResized();

    populationSlider = p5.createSlider(
      populationSliderOptions.min,
      populationSliderOptions.max,
      populationSliderOptions.default,
      populationSliderOptions.step
    );
    populationSlider.parent("pop-slider");
    populationSlider.class("form-control-range");
    multSlider = p5.createSlider(
      multSliderOptions.min,
      multSliderOptions.max,
      multSliderOptions.default,
      multSliderOptions.step
    );
    multSlider.parent("mult-slider");
    multSlider.class("form-control-range");
    groupSlider = p5.createSlider(
      groupSliderOptions.min,
      groupSliderOptions.max,
      groupSliderOptions.default,
      groupSliderOptions.step
    );
    groupSlider.parent("group-slider");
    groupSlider.class("form-control-range");
    preferenceSlider = p5.createSlider(
      preferenceSliderOptions.min,
      preferenceSliderOptions.max,
      preferenceSliderOptions.default,
      preferenceSliderOptions.step
    );
    preferenceSlider.parent("pref-slider");
    preferenceSlider.class("form-control-range");

    [
      populationSlider,
      multSlider,
      groupSlider,
      preferenceSlider
    ].forEach(slider => slider.addClass("custom-range"));

    populationSpan = p5.createSpan();
    populationSpan.parent("pop-number");
    multSpan = p5.createSpan();
    multSpan.parent("mult-number");
    groupSpan = p5.createSpan();
    groupSpan.parent("group-number");
    preferenceSpan = p5.createSpan();
    preferenceSpan.parent("pref-number");
    p5.noStroke();
    p5.frameRate(frameRate);
  };

  p5.draw = function draw() {
    let groups = groupSlider.value();
    let newGroups = groups_ != (groups_ = groups_ = groups);
    if (newGroups) {
      colors = initColors(groups_, p5);
    }
    let mult = multSlider.value();
    let newMult = mult_ != (mult_ = mult);
    let pop = populationSlider.value();
    let newPop = pop_ != (pop_ = pop);
    let newInit = newGroups || newMult || newPop || resized === true;
    if (newInit) {
      resized = false;
      initGrid(mult, p5);
    }
    let pref = preferenceSlider.value();
    let newPref = pref_ != (pref_ = pref);
    changed_ |= newInit || newPref;
    if (changed_) {
      p5.clear();
      changed_ = step(p5);
      updateDisplayValue(populationSpan, populationSlider);
      updateDisplayValue(multSpan, multSlider);
      updateDisplayValue(groupSpan, groupSlider);
      updateDisplayValue(preferenceSpan, preferenceSlider);
    }
  };

  function updateDisplayValue(span, slider) {
    span.html(`(${slider.value()})`);
  }

  function step() {
    let modifiedGrid = grid.map(x => x.slice(0));
    let changed = false;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let groupIndex = grid[i][j];
        if (groupIndex != null) {
          p5.fill(colors[groupIndex]);
          p5.rect(i * mult_, j * mult_, mult_, mult_);

          let similarNeighbors = 0;
          let neighbors = 8;
          for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
              if (!(row == 0 && col == 0)) {
                let neighborGroupIndex =
                  grid[(i + row + grid.length) % grid.length][
                    (j + col + grid[i].length) % grid[i].length
                  ];
                if (neighborGroupIndex == null) {
                  neighbors--;
                } else if (groupIndex == neighborGroupIndex) {
                  similarNeighbors++;
                }
              }
            }
          }
          let neighborProportion =
            neighbors != 0 ? similarNeighbors / neighbors : 1;
          if (neighborProportion < pref_) {
            changed = true;
            while (true) {
              let newRow = Math.floor(Math.random() * grid.length);
              let newCol = Math.floor(Math.random() * grid[i].length);
              if (modifiedGrid[newRow][newCol] == null) {
                modifiedGrid[newRow][newCol] = groupIndex;
                modifiedGrid[i][j] = null;
                break;
              }
            }
          }
        }
      }
    }
    grid = modifiedGrid;
    return changed;
  }

  function initGrid(mult) {
    // debugger;
    grid = Array.from(Array(Math.floor(p5.width / mult)), () => {
      return Array.from(Array(Math.floor(p5.height / mult)), () => {
        if (Math.random() < pop_) return Math.floor(Math.random() * groups_);
        else return null;
      });
    });
  }

  p5.windowResized = function windowResized() {
    resized = true;
    let canvas = p5.select("#canvas");

    p5.resizeCanvas(canvas.width, canvas.height);
  };
};

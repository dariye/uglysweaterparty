import Two from 'two.js'
import chroma from 'chroma-js'
import _ from 'underscore'

Two.prototype.makeSquiggle = function(width, height, phi) {
  const amt = 64;

  const squiggle = this.makeCurve(
    _.map(_.range(amt), function(i) {
      const pct = i / (amt - 1);
      const theta = pct * Math.PI * 2 * phi + Math.PI / 2;
      const x = width * pct - width / 2;
      const y = height / 2 * Math.sin(theta);
      return new Two.Anchor(x, y);
    }),
    true
  );

  return squiggle;

};

Two.prototype.makeNonagon = function(width, height, sides) {

  width /= 2;
  height /= 2;

  const shape = this.makePath(
    _.map(_.range(sides), function(i) {
      const pct = i / sides;
      const theta = Math.PI * 2 * pct - Math.PI / 2;
      const x = width * Math.cos(theta);
      const y = height * Math.sin(theta);
      return new Two.Anchor(x, y);
    })
  );

  return shape;

};

function main() {
  const baseColors = {
    greenPea: '#165B33',
    jewel: '#146B3A',
    seaBuckthorn: '#F8B229',
    cinnabar: '#EA4630',
    tallPoppy: '#BB2528'
  }

  const colors = Object.keys(baseColors).map(key => chroma(baseColors[key]))

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

  const canvas = document.getElementById('canvas')
  const two = new Two({
    width: window.innerWidth,
    height: window.innerHeight,
    fullscreen: true,
    autostart: true,
  }).appendTo(canvas)
  two.renderer.domElement.style.position = 'absolute';
  two.renderer.domElement.style.top = 0;
  two.renderer.domElement.style.left = 0;

  resize()

  /**
  * Group: Background
  * Type: Shape
  */
  const background = two.makeRectangle(two.width/2, two.height/2, two.width, two.height)
  background.noStroke()
  background.fill = 'rgb(255, 255, 175)'
  background.name = 'background'

  /**
  * Container
  * Type: Group
  */
  const container = two.makeGroup(background)


  /**
  * Cursor
  * Type: 

  /**
  * Group: Sweater
  * Type: SVG
  * Christmas sweater by Shirley Hernández Ticona from the Noun Project
  */

  const byob = two.interpret(document.getElementById('byob'))
  byob.center()
  byob.translation.set(two.width/2, two.height/3)
  byob.opacity = 0.3
  byob.scale = 1.5

  container.add(byob)

  const sweater = two.interpret(document.getElementById('sweater'))
  sweater.center()
  sweater.translation.set(two.width/2, two.height/3)
  sweater.scale = 1.5

  container.add(sweater)

  const title = two.interpret(document.getElementById('title'))
  title.center()
  title.translation.set(two.width/2, sweater.getBoundingClientRect().height)
  title.scale = 0.4

  container.add(title)

  const details = two.interpret(document.getElementById('details'))
  details.center()
  details.translation.set(two.width/2, title.getBoundingClientRect().bottom + 200)
  details.scale = 0.3

  container.add(details)



  /**
  * Group: Confetti
  * Type: Shapes
  */

  const rows = Math.floor(two.height / 100)
  const cols = Math.floor(two.width / 100)
  const width = Math.round(two.height / Math.max(rows, cols))

  for (let i = 0; i < rows; i++) {
    const even = !!(i%2)
    const vi = i / (rows - 1)

    for (let j = 0; j < cols; j++) {
      let k = j
      if (even) {
        k += 0.5
        if (j >= cols - 1 ) {
          continue
        }
      }

      const hi = k / (cols - 1);

      const type = !!(j % 2) ? 'Squiggle' : 'Nonagon';
      const height = !!(j % 2) ? width / 3 : width;
      const shape = two['make' + type](width, height, Math.floor(Math.random() * 3) + 3);
      const color = getRandomColor().alpha(0.4).hex()

      shape.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
      shape.translation.set(hi * two.width, vi * two.height);

      if (j % 2) {
        shape.noFill();
        shape.stroke = color;
        shape.linewidth = 4;
        shape.cap = 'round';
      } else {
        shape.noStroke();
        shape.fill = color;
      }

      shape.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
      shape.step *= Math.random() > 0.5 ? - 1 : 1;

      container.add(shape);
    }
  }

  const add = _.debounce((evt) => {
    const x = evt.clientX
    const y = evt.clientY

    const hi = Math.floor(Math.random() * rows) / (cols - 1);

    const type = !!(Math.floor(Math.random() * cols) % 2) ? 'Squiggle' : 'Nonagon';
    const height = !!(Math.floor(Math.random() * cols) % 2) ? width / 3 : width;
    const shape = two['make' + type](width, height, Math.floor(Math.random() * 3) + 3);
    const color = getRandomColor().alpha(0.4).hex()

    shape.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
    shape.translation.set(x, y);

    if (Math.floor(Math.random() * cols) % 2) {
      shape.noFill();
      shape.stroke = color;
      shape.linewidth = 4;
      shape.cap = 'round';
    } else {
      shape.noStroke();
      shape.fill = color;
    }

    shape.opacity = 0.4

    shape.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
    shape.step *= Math.random() > 0.5 ? - 1 : 1;

    container.add(shape)

  }, 500)

  const cursor = two.makeCircle(0, 0, 20);
  cursor.opacity = 0.1
  cursor.target = new Two.Vector();
  cursor.target.set(two.width / 2, two.height / 2);
  cursor.translation.copy(cursor.target);

  const center = _.debounce(function() {
    cursor.target.set(two.width / 2, two.height / 2);
  }, 500);

  const drag = function(e) {
    cursor.target.set(e.clientX, e.clientY);
    center();
  };

  const touchDrag = function(e) {
    e.preventDefault();
    var touch = e.originalEvent.changedTouches[0];
    drag({
      clientX: touch.pageX,
      clientY: touch.pageY
    });
    return false;
  };

  two
    .bind('resize', () => {
      // container.translation.set(two.width/2, two.width/2)
      const scale = container.offsetWidth / two.width
      two.scene.scale = scale
    })
    .bind('update', (frameCount) => {
      cursor.translation.x += (cursor.target.x - cursor.translation.x) * 0.125;
      cursor.translation.y += (cursor.target.y - cursor.translation.y) * 0.125;
      for (let k in container.children) {
        const child = container.children[k];
        if (child.name === 'background') {
          continue;
        }
        if (child.step) child.rotation += child.step;
      }
    })


  function resize () {
    const width = window.innerWidth
    const height = window.innerHeight
    two.renderer.setSize(width, height)
  }

  window.addEventListener('resize', resize, false)
  window.addEventListener('click', add)
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', touchDrag)
}

window.onload = main

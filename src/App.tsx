import { Accessor, createEffect, createSignal, Setter, untrack, type Component } from 'solid-js';
import ColorConverter, { Hsl } from './ColorConverter';

Object.keys(ColorConverter).forEach(key => {
  (window as any)[key] = (ColorConverter as any)[key];
});

interface ColorData {
  hex: string,
  label: string,
  lineNum: number,
}

enum ColorSpace {
  HSL,
  HSV,
  OkLrCH,
}

const App: Component = () => {
  let [colors, setColors] = createSignal<[Accessor<ColorData>, Setter<ColorData>][]>([]);
  let [text, setText] = createSignal("red: #ff0000\ngreen: #00ff00\nblue: #0000ff");
  let [colorSpace, setColorSpace] = createSignal(ColorSpace.HSL);

  const updateColors = (text: string) => {
    setText(text);

    let colorData: [Accessor<ColorData>, Setter<ColorData>][] = [];
    text.split("\n").forEach((line, i) => {
      let hexMatch = line.match(/#[a-f\d]{6}/i);
      if(hexMatch !== null) {
        colorData.push(createSignal({hex: hexMatch[0], label: line, lineNum: i}));
      }
    });

    setColors(colorData);
  };

  createEffect(() => {
    let lines = untrack(() => text()).split("\n");
    
    colors().forEach(color => {
      let currentColor = color[0]();
      let hexMatch = lines[currentColor.lineNum].match(/#[a-f\d]{6}/i);
      if(hexMatch !== null && currentColor.hex.toLowerCase() !== hexMatch[0].toLowerCase()) {
        lines[currentColor.lineNum] = lines[currentColor.lineNum].replace(hexMatch[0], currentColor.hex);
      }
    })

    setText(lines.join("\n"));
  });

  updateColors(text());

  return (
    <div class="p-6 mx-[10%] h-[100vh] grid grid-cols-[67%_33%]">
      <div class="p-3 overflow-y-scroll">
        <select 
          value={colorSpace()}
          onChange={e => setColorSpace(parseInt(e.target.value))}
          class="mx-auto block mb-3"
        >
          <option value={ColorSpace.HSL}>HSL</option>
          <option value={ColorSpace.HSV}>HSV</option>
          <option value={ColorSpace.OkLrCH}>OkLrCH</option>
        </select>
        {colors().map(color => 
          <ColorWidget color={color[0]} setColor={color[1]} colorSpace={colorSpace} />
        )}
      </div>
      <textarea
        class="p-3 overflow-y-scroll resize-none
          border-2 border-gray-500 focus:border-gray-900 outline-none"
        placeholder="Put hex codes here..."
        onInput={e => updateColors(e.target.value)}
        value={text()}
      >
      </textarea>
    </div>
  );
};

interface ColorWidgetProps {
  color: () => ColorData;
  setColor: (color: ColorData) => void;
  colorSpace: () => ColorSpace;
}

const ColorWidget: Component<ColorWidgetProps> = props => {
  return (
    <div class="grid h-25 grid-cols-[33%_67%]">
      <div class="flex items-center gap-3">
        <div class="max-h-25 flex-grow text-center overflow-hidden text-ellipsis">{props.color().label}</div>
        <div style={{"background-color": props.color().hex}} class="min-w-15 w-15 h-25"></div>
      </div>
      <Sliders color={props.color} setColor={props.setColor} colorSpace={props.colorSpace} />
    </div>
  );
}

interface SlidersProps {
  color: () => ColorData;
  setColor: (color: ColorData) => void;
  colorSpace: () => ColorSpace;
}

enum UpdateValue {
  Slider1,
  Slider2,
  Slider3,
}

const Sliders: Component<SlidersProps> = (props) => {
  let [slider1, setSlider1] = createSignal(0);
  let [slider2, setSlider2] = createSignal(0);
  let [maxChroma, setMaxChroma] = createSignal(100);
  let [slider3, setSlider3] = createSignal(0);

  const onChange = (updateValue: UpdateValue, e: Event) => {
    switch(updateValue) {
      case UpdateValue.Slider1:
        setSlider1(parseInt((e.target as HTMLInputElement).value));
        break;
      case UpdateValue.Slider2:
        setSlider2(parseInt((e.target as HTMLInputElement).value));
        break;
      case UpdateValue.Slider3:
        setSlider3(parseInt((e.target as HTMLInputElement).value));
        break;
    }

    updateColor();
  };

  const updateColor = () => {
    let currentColor = props.color();
    currentColor = {hex: currentColor.hex, label: currentColor.label, lineNum: currentColor.lineNum};

    let oldHex = currentColor.hex;
    let rgb = 
      props.colorSpace() === ColorSpace.HSL ?
        ColorConverter.hslToRgb({
          h: slider1(),
          s: slider2() / 100,
          l: slider3() / 100,
        }) :
      props.colorSpace() === ColorSpace.HSV ?
        ColorConverter.hsvToRgb({
          h: slider1(),
          s: slider2() / 100,
          v: slider3() / 100,
        }) :
      ColorConverter.oklrchToRgb({
        h: slider1(),
        c: slider2() / 100 * 0.33,
        l: slider3() / 100,
      });
    currentColor.hex = ColorConverter.rgbToHex(rgb);
    currentColor.label = currentColor.label.replace(oldHex, currentColor.hex);
    props.setColor(currentColor);
  }

  const updateColorSpace = () => {
    let hex = untrack(() => props.color().hex);
    let rgb = ColorConverter.hexToRgb(hex);

    switch(props.colorSpace()) {
      case ColorSpace.HSL:
        let hsl = ColorConverter.rgbToHsl(rgb);
        setSlider1(Math.round(hsl.h));
        setSlider2(Math.round(hsl.s * 100));
        setSlider3(Math.round(hsl.l * 100));
        break;
      case ColorSpace.HSV:
        let hsv = ColorConverter.rgbToHsv(rgb);
        setSlider1(Math.round(hsv.h));
        setSlider2(Math.round(hsv.s * 100));
        setSlider3(Math.round(hsv.v * 100));
        break;
      case ColorSpace.OkLrCH:
        let oklrch = ColorConverter.rgbToOklrch(rgb);
        setSlider1(Math.round(oklrch.h));
        setSlider2(Math.round(oklrch.c * 100 / 0.33));
        setSlider3(Math.round(oklrch.l * 100));
        break;
    }
  }
  updateColorSpace();
  createEffect(updateColorSpace);

  createEffect(() => {
    if(props.colorSpace() === ColorSpace.OkLrCH) {
      setMaxChroma(ColorConverter.oklrchMaxChroma(slider3() / 100, slider1()));
      if(slider2() / 100 * 0.33 > maxChroma()) setSlider2(maxChroma() * 100 / 0.33);
    }
  });

  return (
    <div class="flex h-25 px-3 gap-3">
      <div class="grid grid-rows-3 items-center">
        <div class="text-right">Hue: </div>
        <div class="text-right">
          {props.colorSpace() === ColorSpace.OkLrCH ? "Chroma: " : "Saturation: "}
        </div>
        <div class="text-right">
          {
            props.colorSpace() === ColorSpace.HSL ? "Lightness: " :
            props.colorSpace() === ColorSpace.HSV ? "Value: " :
            "Luminance: "
          }
        </div>
      </div>
      <div class="w-6 grid grid-rows-3 items-center">
        <div class="text-center">{Math.round(slider1())}</div>
        <div class="text-center">{
          props.colorSpace() === ColorSpace.OkLrCH ?
            (slider2() / 100 / 0.33).toFixed(2) :
            Math.round(slider2())
        }</div>
        <div class="text-center">{
          props.colorSpace() === ColorSpace.OkLrCH ?
            (slider3() / 100).toFixed(2) :
            Math.round(slider3())
        }</div>
      </div>
      <div class="flex-grow grid grid-rows-3 items-center">
        <input
          type="range"
          min="0"
          max="360"
          value={slider1()}
          class="slider"
          oninput={e => onChange(UpdateValue.Slider1, e)}
        ></input>
        <input
          type="range"
          min="0"
          max="100"
          value={slider2()}
          style={props.colorSpace() === ColorSpace.OkLrCH
            ? {
              background: `linear-gradient(to right, 
                oklch(80% 0 0) calc(0.5rem + ${maxChroma() / 0.33} * (100% - 1rem)),
                transparent calc(0.5rem + ${maxChroma() / 0.33} * (100% - 1rem))
              )`
            } : {}
          }
          class="slider2"
          oninput={e => onChange(UpdateValue.Slider2, e)}
        ></input>
        <input
          type="range"
          min="0" 
          max="100" 
          value={slider3()}
          class="slider3"
          oninput={e => onChange(UpdateValue.Slider3, e)}
        ></input>
      </div>
    </div>
  );
};

export default App;

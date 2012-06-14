[demo]: http://jakobkallin.github.com/RPG-Ambience/demo.html
[yaml]: http://en.wikipedia.org/wiki/YAML
[effect]: #effect

# RPG Ambience

RPG Ambience enables you to play audio and show visuals in fullscreen during tabletop RPG sessions, using your monitor as the stage. The audio and visuals are grouped into **scenes**, which you define in an **adventure file**. You control the scenes using your keyboard, which lets you start, stop, and pause them at any time during the session.

## Starting, stopping, and pausing scenes

Playback of scenes can be controlled in the following ways:

- **Starting a scene:**
    - **By key:** If the scene has a `key` defined, pressing this key starts the scene.
    - **By name:** If the scene has a `name` defined, typing this name and pressing `Enter` starts the scene. It is enough to type the start of the name.
- **Stopping a scene:** Pressing `Enter` stops the currently playing scene.
- **Pausing a scene:** Pressing `Space` pauses the currently playing scene. Pressing `Space` again resumes it.

## Structure of an adventure file

An adventure file is a [YAML][yaml] document that defines the audio and visuals available to you during the session. The central part of this document is a list of scenes, each of which contains **properties** that define how it appears and behaves. Ambience prompts you for an adventure file when it starts.

### Example

The example below illustrates the outline of an adventure file. The various properties that make up scenes, such as `key` and `image`, are described in the next section.

```yaml
scenes:
    -
        key: F1
        image: intro.jpg
        sound: main-theme.mp3
    -
        key: F2
        sound: combat-theme.mp3
```

## Properties of a scene

Scenes have the following properties:

- [`background`](#background)
- [`fade`](#fade)
- [`image`](#image)
- [`key`](#key)
- [`name`](#name)
- [`sound`](#sound)
- [`sound-order`](#sound-order)
- [`text`](#text-and-text-style)
- [`text-style`](#text-and-text-style)

### Background
The `background` property defines a color that will fill the background of the browser window when the scene is playing. The default is `black`.

```yaml
image: examples/jack-face-details.jpg
background: white
```

To try this example, [open the demo][demo] and press `F1`.

### Fade
The `fade` property defines how many seconds a scene's visuals will take to appear and disappear when the scene is started and stopped.

```yaml
image: examples/shaman-previz.jpg
fade: 2
```

To try this example, [open the demo][demo] and press `F2`.

### Image
The `image` property defines the path of an image that will be displayed when the scene is playing. The image will be centered in the browser window and automatically scale to fill the window without losing proportion or being clipped.

#### Example
```yaml
image: examples/ishtar_rooftop.jpg
```

To try this example, [open the demo][demo] and press `F3`.

### Key
The `key` property defines a key that can be pressed to start the scene.

For more information about controlling scene playback, see [Starting, stopping, and pausing scenes](#starting-stopping-and-pausing-scenes).

#### Example
```yaml
key: F3
image: examples/ishtar_rooftop.jpg
```

To try this example, [open the demo][demo] and press `F3`.

### Name
The `name` property defines a name that can be typed to start the scene.

For more information about controlling scene playback, see [Starting, stopping, and pausing scenes](#starting-stopping-and-pausing-scenes).

#### Example
```yaml
name: dragons
sound: examples/8-Circling_Dragons.mp3
```

To try this example, [open the demo][demo], type "dragons", and press `Enter`.

### Sound
The `sound` property defines the path of a sound file that will be looped when the scene is playing. The property can be a list of paths, in which case all of the sounds will be looped in order.

#### Example
```yaml
sound: examples/8-Circling_Dragons.mp3
```

To try this example, [open the demo][demo] and press `F4`.

### Sound order
If a list of sound files has been defined in the `sound` property, the `sound-order` property defines which order these sounds will be played in.

- `linear`: the sounds will be played in the order that they were defined **(default)**
- `random`: the sounds will be played in a random order

#### Example

```yaml
sound-order: random
sound:
    - examples/8-Circling_Dragons.mp3
    - examples/9-Trailer_Music.mp3
```

To try this example, [open the demo][demo] and press `F5`. Each time you press `F5`, one of the two sound files will be played at random.

### Text and text style
The `text` property defines a message that will be displayed when the scene is playing.

The `text-style` property defines how the message defined in the `text` property will look. It consists of many different properties that define aspects of the text's appearance. The list of possible properties is the same as [those used in CSS](http://reference.sitepoint.com/css/typography).

#### Example
```yaml
text: Once upon a time…
textStyle:
    font-family: Georgia
    font-size: 40px
```

To try this example, [open the demo][demo] and press `F6`.

### Template
When you have several scenes that share common properties, the `template` property lets you define all of those common properties in a single place. Templates are defined in a separate part of the adventure file and are referred to by name.

#### Example
```yaml
scenes:
    [...]
    -
        template: intro
        text-style:
            font-style: italic
    -
        template: intro
        text-style:
            font-weight: bold
    [...]
templates:
    intro:
        text: A long time ago…
        text-style:
            font-family: Georgia
            font-size: 40px
```

To try this example, [open the demo][demo] and press `F7` and `F8`.

## Technical details

### Local files and URLs
Whenever a file path is asked for in Ambience, either a local file path or a URL can be provided. All local file paths are relative to the `index.html` file, not the adventure file.

Note that Google Chrome must be started with the `--allow-file-access-from-files` argument in order to allow access to local files, and that is only if the `index.html` file is itself on your computer.

### File formats
Ambience supports all audio and image formats that your browser supports. This typically includes WAV, JPG, PNG, and GIF. In modern desktop browsers, it also includes SVG.

Note that Mozilla Firefox does not support MP3 audio.

## Credits

All images and audio in [the demo][demo] are taken from the movie [Sintel](http://www.sintel.org/) by the [Blender Foundation](http://www.blender.org/blenderorg/blender-foundation/).
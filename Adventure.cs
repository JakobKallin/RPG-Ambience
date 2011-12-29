using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;

namespace Ambience
{
    public class Adventure
    {
        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public ICollection<AudioVisual> Scenes { get; private set; }

        [DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
        public ICollection<AudioVisual> Effects { get; private set; }

        public Adventure()
        {
            Scenes = new List<AudioVisual>();
            Effects = new List<AudioVisual>();
            /*var logo = new AudioVisual()
            {
                Key = Key.F12,
                Background = Brushes.Black,
                Image = new Uri(@"C:\star-wars.png"),
                Sound = new Uri(@"C:\intro.mp3")
            };

            var text = new AudioVisual()
            {
                Key = Key.F11,
                Background = Brushes.Black,
                FadeDuration = 2,
                Delay = 2,
                Text = new Text
                {
                    String = "För länge sedan i en galax långt,\nlångt bort. . . .",
                    Font = new FontFamily("Franklin Gothic Medium"),
                    Color = Brushes.Cyan,
                    Size = 40
                },
                Next = logo
            };
            Effects.Add(text);
            Effects.Add(logo);

            var clonetroopers = new AudioVisual()
            {
                Key = Key.F2,
                Background = Brushes.White,
                Image = new Uri(@"C:\clonetroopers.jpg"),
                Sound = new Uri(@"C:\medley.mp3")
            };
            Scenes.Add(clonetroopers);
            Effects.Add(new AudioVisual()
            {
                Key = Key.F1,
                Background = Brushes.White,
                Image = new Uri(@"C:\parchment.jpg"),
                Sound = new Uri(@"C:\door.mp3"),
                Text = new Text()
                {
                    String = "Vi har eran prässt.\nGe oss våran\nprässt ok trolformelln eler så dör hann.",
                    Font = new FontFamily("Perpetua"),
                    Color = Brushes.Black,
                    Style = FontStyles.Italic,
                    Size = 40
                },
                Next = clonetroopers
            });*/
        }

        public AudioVisual KeyedScene(Key key)
        {
            return Scenes.FirstOrDefault(av => av.Key == key);
        }

        public AudioVisual KeyedEffect(Key key)
        {
            return Effects.FirstOrDefault(av => av.Key == key);
        }

        public bool ContainsKeyedAudioVisual(Key key)
        {
            return KeyedScene(key) != null || KeyedEffect(key) != null;
        }

        public AudioVisual NamedScene(string name)
        {
            return Scenes.FirstOrDefault(av => av.Name != null && av.Name.StartsWith(name, StringComparison.OrdinalIgnoreCase));
        }

        public AudioVisual NamedEffect(string name)
        {
            return Effects.FirstOrDefault(av => av.Name != null && av.Name.StartsWith(name, StringComparison.OrdinalIgnoreCase));
        }

        public bool ContainsNamedAudioVisual(string name)
        {
            return NamedScene(name) != null || NamedEffect(name) != null;
        }
    }
}

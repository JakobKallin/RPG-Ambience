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

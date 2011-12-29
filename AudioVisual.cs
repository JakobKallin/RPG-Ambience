using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Input;
using System.Windows.Markup;
using System.Windows.Media;

namespace Ambience
{
    [RuntimeNameProperty("Name")]
    public class AudioVisual
    {
        public string Name { get; set; }
        public Key Key { get; set; }

        public Brush Background { get; set; }
        public Uri Image { get; set; }
        public HorizontalAlignment HorizontalAlignment { get; set; }
        public Uri Sound { get; set; }
        public Uri Video { get; set; }
        public Text Text { get; set; }
        public double FadeDuration { get; set; }
        public double Delay { get; set; }
        public AudioVisual Next { get; set; }

        public AudioVisual()
        {
            HorizontalAlignment = HorizontalAlignment.Center;
        }

        public bool ContainsVisuals
        {
            get
            {
                return Background != null || Image != null || Video != null || Text != null;
            }
        }

        public bool ContainsAudio
        {
            get { return Sound != null; }
        }
    }
}

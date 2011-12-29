using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Media;

namespace Ambience
{
    public class RepeatingMediaPlayer : MediaPlayer
    {
        public RepeatingMediaPlayer()
        {
            MediaEnded += Repeat;
        }

        public void Repeat(object sender, EventArgs e)
        {
            Stop();
            Play();
        }
    }
}

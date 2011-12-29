using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Media.Animation;

namespace Ambience
{
    class FadeAnimation : DoubleAnimation
    {
        public FadeAnimation(MainWindow window, double to, double duration, Action onFadeEnded = null)
        {
            To = to;
            Duration = new Duration(TimeSpan.FromSeconds(duration));
            if (onFadeEnded != null)
            {
                Completed += (s, e) => onFadeEnded();
            }
        }
    }
}

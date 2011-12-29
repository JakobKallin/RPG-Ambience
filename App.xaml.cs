using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Windows;

namespace Ambience
{
    public partial class App : Application
    {
        private void OnStartup(object sender, StartupEventArgs e)
        {
            MainWindow window = null;
            if ( e.Args.Length == 0 )
            {
                window = new MainWindow();
            }
            else
            {
                var adventureFilePath = e.Args[0];
                window = new MainWindow(adventureFilePath);
            }

            window.Show();
        }
    }
}

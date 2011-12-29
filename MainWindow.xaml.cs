using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Threading;

namespace Ambience
{
    public partial class MainWindow : Window
    {
        public Adventure Adventure { get; set; }
        private FileInfo AdventureFile { get; set; }
        public AudioVisual CurrentScene { get; set; }
        public AudioVisual CurrentEffect { get; set; }
        private bool IsPaused { get; set; }
        private bool IsFading { get; set; }

        private string EnteredName { get; set; }
        public readonly IDictionary<Key, Action> Commands = new Dictionary<Key, Action>();
        public readonly RepeatingMediaPlayer SceneSoundPlayer = new RepeatingMediaPlayer();
        public readonly MediaPlayer EffectSoundPlayer = new MediaPlayer();
        private DispatcherTimer EffectTimer { get; set; }

        public MainWindow()
        {
            FileInfo adventureFile = ShowAdventureDialog();
            Initialize(adventureFile);
        }

        public MainWindow(string adventureFilePath)
        {
            Initialize(new FileInfo(adventureFilePath));
        }

        private void Initialize(FileInfo adventureFile)
        {
            InitializeComponent();
            EnteredName = String.Empty;
            LoadAdventure(adventureFile);
            WatchForAdventureChanges();
            AddCommands();
        }

        private static FileInfo ShowAdventureDialog()
        {
            var dialog = new System.Windows.Forms.OpenFileDialog()
            {
                FileName = "Ambience.xaml"
            };
            dialog.ShowDialog();
            return new FileInfo(dialog.FileName);
        }

        private void LoadAdventure(FileInfo adventureFile)
        {
            try
            {
                Adventure = (Adventure)XamlReader.Load(adventureFile.OpenRead());
                AdventureFile = adventureFile;
            }
            catch ( Exception exception )
            {
                MessageBox.Show(
                    "There was an error loading the adventure at " +
                    adventureFile.FullName +
                    ": \n\n" +
                    exception.Message
                );
                var newAdventureFile = ShowAdventureDialog();
                LoadAdventure(newAdventureFile);
            }
        }

        private void WatchForAdventureChanges()
        {
            var watcher = new FileSystemWatcher(AdventureFile.DirectoryName);
            watcher.Changed += new FileSystemEventHandler(OnAdventureChanged);
            watcher.EnableRaisingEvents = true;
        }

        private void OnAdventureChanged(object sender, FileSystemEventArgs e)
        {
            try
            {
                LoadAdventure(AdventureFile);
            }
            catch ( IOException )
            {
                // File is changed twice and if we access it right before the second change (I think), it crashes.
            }
        }

        private void PlayScene(AudioVisual scene)
        {
            EnteredName = String.Empty;
            StopEverything();
            SetBackground(ScenePanel, scene);
            SetImage(SceneImageDisplay, scene);
            SetSound(SceneSoundPlayer, scene);
            SetVideo(SceneVideoPlayer, scene);
        }

        private void StopScene()
        {
            ScenePanel.Background = Brushes.Black;
            SceneImageDisplay.Source = null;
            SceneSoundPlayer.Close();
            SceneVideoPlayer.Source = null;

            CurrentScene = null;
        }

        private void PlayEffect(AudioVisual newEffect)
        {
            EnteredName = String.Empty;
            RemoveEffect();

            if (newEffect.ContainsVisuals)
            {
                FadeInEffect(newEffect.FadeDuration);
            }
            else
            {
                EffectSoundPlayer.MediaEnded += StopEffectOnSoundEnded;
            }

            if (newEffect.ContainsAudio)
            {
                SetSound(EffectSoundPlayer, newEffect);
                EffectSoundPlayer.MediaOpened += DisplayVisualsOnSoundLoaded;
            }
            else
            {
                SetBackground(EffectPanel, newEffect);
                SetImage(EffectImageDisplay, newEffect);
                SetSound(EffectSoundPlayer, newEffect);
                SetVideo(EffectVideoPlayer, newEffect);
                SetText(EffectTextDisplay, newEffect);
            }

            CurrentEffect = newEffect;
        }

        private void PlayEffect(AudioVisual newEffect, double delay)
        {
            if (delay == 0)
            {
                PlayEffect(newEffect);
            }
            else
            {
                StartEffectTimer(newEffect, delay);
            }
        }

        private void StartEffectTimer(AudioVisual newEffect, double delay)
        {
            EffectTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(delay) };
            EffectTimer.Tick += delegate
            {
                EffectTimer.Stop();
                PlayEffect(newEffect);
            };
            EffectTimer.Start();
        }

        private void StopEffectTimer()
        {
            if (EffectTimer != null)
            {
                EffectTimer.Stop();
                EffectTimer = null;
            }
        }

        private void DisplayVisualsOnSoundLoaded(object sender, EventArgs e)
        {
            SetBackground(EffectPanel, CurrentEffect);
            SetImage(EffectImageDisplay, CurrentEffect);
            SetVideo(EffectVideoPlayer, CurrentEffect);
            SetText(EffectTextDisplay, CurrentEffect);
            EffectSoundPlayer.MediaOpened -= DisplayVisualsOnSoundLoaded;
        }

        private void FadeInEffect(double duration)
        {
            var animation = new FadeAnimation(this, 1, duration, delegate { IsFading = false; });
            IsFading = true;
            EffectPanel.BeginAnimation(Panel.OpacityProperty, animation);
        }

        private void StopEffect()
        {
            // This has to happen before the if-null return statement below, because there can be an effect timer going even when there is no currently active effect.
            StopEffectTimer();

            if (CurrentEffect == null)
            {
                return;
            }

            if (IsFading)
            {
                RemoveEffect();
            }
            else
            {
                FadeOutEffect();
            }
        }

        private void FadeOutEffect()
        {
            Action onFadeEnded;
            if (CurrentEffect == null || CurrentEffect.Next == null)
            {
                onFadeEnded = RemoveEffect;
            }
            else
            {
                var next = CurrentEffect.Next;
                var delay = CurrentEffect.Delay;
                onFadeEnded = delegate
                {
                    RemoveEffect();
                    PlayEffect(next, delay);
                };
            }

            var animation = new FadeAnimation(this, 0, CurrentEffect.FadeDuration, onFadeEnded);
            IsFading = true;
            EffectPanel.BeginAnimation(Panel.OpacityProperty, animation);
        }
        
        private void RemoveEffect()
        {
            EffectPanel.BeginAnimation(Panel.OpacityProperty, null);
            EffectPanel.Opacity = 0;
            IsFading = false;
            EffectSoundPlayer.Close();
            EffectVideoPlayer.Source = null;
            EffectTextDisplay.Text = null;

            CurrentEffect = null;
        }

        private void SetBackground(Panel panel, AudioVisual audioVisual)
        {
            if (audioVisual.Background == null)
            {
                panel.Background = Brushes.Black;
            }
            else
            {
                panel.Background = audioVisual.Background;
            }
        }

        private void SetImage(Image display, AudioVisual audioVisual)
        {
            if (audioVisual.Image == null)
            {
                display.Source = null;
            }
            else
            {
                try
                {
                    display.Source = new BitmapImage(audioVisual.Image);
                    display.HorizontalAlignment = audioVisual.HorizontalAlignment;
                }
                catch ( Exception )
                {
                    // Don't display image.
                }
            }
        }

        private void SetSound(MediaPlayer player, AudioVisual audioVisual)
        {
            player.Close();
            if (audioVisual.Sound != null)
            {
                if ( player == SceneSoundPlayer )
                {
                    player.Volume = 0.25;
                }
                else if ( player == EffectSoundPlayer )
                {
                    player.Volume = 1;
                }

                player.Open(audioVisual.Sound);
                player.Play();
            }
        }

        private void SetVideo(MediaElement player, AudioVisual audioVisual)
        {
            player.Close();
            if (audioVisual.Video != null)
            {
                player.Source = audioVisual.Video;
                player.Play();
            }
        }

        private void SetText(TextBlock display, AudioVisual audioVisual)
        {
            if (audioVisual.Text == null)
            {
                display.Text = null;
            }
            else
            {
                display.Text = audioVisual.Text.String;
                display.Foreground = audioVisual.Text.Color;
                display.FontFamily = audioVisual.Text.Font;
                display.FontSize = audioVisual.Text.Size;
                display.FontStyle = audioVisual.Text.Style;
            }
        }

        private void StopEffectOnSoundEnded(object sender, EventArgs e)
        {
            CurrentEffect = null;
            EffectSoundPlayer.MediaEnded -= StopEffectOnSoundEnded;
        }

        private void AddCommands()
        {
            Commands[Key.Enter] = delegate
            {
                if ( String.IsNullOrEmpty(EnteredName) )
                {
                    Stop();
                }
                else
                {
                    PlayNamedAudioVisual(EnteredName);
                    EnteredName = String.Empty;
                }
            };
            Commands[Key.Escape] = LeaveFullscreen;
            Commands[Key.Space] = Pause;
            Commands[Key.Back] = BackspaceName;
        }

        private void PlayKeyedAudioVisual(Key key)
        {
            var scene = Adventure.KeyedScene(key);
            if ( scene == null )
            {
                var effect = Adventure.KeyedEffect(key);
                if ( effect != null )
                {
                    PlayEffect(effect);
                }
            }
            else
            {
                PlayScene(scene);
            }
        }

        private void PlayNamedAudioVisual(string name)
        {
            var scene = Adventure.NamedScene(name);
            if ( scene == null )
            {
                var effect = Adventure.NamedEffect(name);
                if ( effect != null )
                {
                    PlayEffect(effect);
                }
            }
            else
            {
                PlayScene(scene);
            }
        }

        private void Stop()
        {
            if (CurrentEffect == null)
            {
                StopScene();
                StopEffectTimer();
            }
            else
            {
                StopEffect();
            }
        }

        private void StopEverything()
        {
            StopEffect();
            StopScene();
        }

        private void Pause()
        {
            if (IsPaused)
            {
                SceneSoundPlayer.Play();
                SceneVideoPlayer.Play();
                EffectSoundPlayer.Play();
                EffectVideoPlayer.Play();
            }
            else
            {
                SceneSoundPlayer.Pause();
                SceneVideoPlayer.Pause();
                EffectSoundPlayer.Pause();
                EffectVideoPlayer.Pause();
            }

            IsPaused = !IsPaused;
        }

        private void OnKeyDown(object sender, KeyEventArgs e)
        {
            // This is needed to enable F10 as a hotkey (among others, probably).
            Key pressedKey;
            if ( e.Key == Key.System )
            {
                pressedKey = e.SystemKey;
            }
            else
            {
                pressedKey = e.Key;
            }

            if (Commands.ContainsKey(pressedKey))
            {
                Commands[pressedKey]();
                e.Handled = true;
            }
            else if ( Adventure.ContainsKeyedAudioVisual(pressedKey) )
            {
                PlayKeyedAudioVisual(pressedKey);
                e.Handled = true;
            }
            else
            {
                // Key will generate a TextInput event.
            }
        }

        private void BackspaceName()
        {
            if ( EnteredName.Length > 0 )
            {
                EnteredName = EnteredName.Substring(0, EnteredName.Length - 1);
            }
        }

        private void OnTextInput(object sender, TextCompositionEventArgs e)
        {
            EnteredName += e.Text;
        }

        private bool IsInFullscreen
        {
            get { return WindowStyle == WindowStyle.None; }
        }

        private void EnterFullscreen()
        {
            WindowStyle = WindowStyle.None;
            WindowState = WindowState.Maximized;
            ResizeMode = ResizeMode.NoResize;
            Mouse.OverrideCursor = Cursors.None;
        }

        private void LeaveFullscreen()
        {
            WindowStyle = WindowStyle.SingleBorderWindow;
            WindowState = WindowState.Normal;
            ResizeMode = ResizeMode.CanResize;
            Mouse.OverrideCursor = Cursors.Arrow;
        }

        private void ToggleFullScreen()
        {
            if ( IsInFullscreen )
            {
                LeaveFullscreen();
            }
            else
            {
                EnterFullscreen();
            }
        }

        private void OnMouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            ToggleFullScreen();
        }

        private void OnDrop(object sender, DragEventArgs e)
        {
            if ( e.Data.GetDataPresent(DataFormats.FileDrop) )
            {
                string[] paths = e.Data.GetData(DataFormats.FileDrop, true) as string[];
                SceneImageDisplay.Source = new BitmapImage(new Uri(paths[0]));
            }
        }
    }
}

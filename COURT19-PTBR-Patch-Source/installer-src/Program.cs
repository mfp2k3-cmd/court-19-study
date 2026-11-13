using System.Diagnostics;

namespace Court19PtbrInstaller;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new InstallerForm());
    }
}

internal sealed class InstallerForm : Form
{
    private readonly TextBox _dump = new();
    private readonly TextBox _mod = new();
    private readonly RichTextBox _log = new();
    private readonly ProgressBar _progress = new();
    private readonly Label _status = new();
    private readonly Button _install = new();
    private readonly Button _restore = new();
    private bool _running;

    public InstallerForm()
    {
        Text = "COURT 19 — Instalar tradução PT-BR";
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(760, 625);
        MinimumSize = new Size(700, 650);
        Font = new Font("Segoe UI", 10F);
        BackColor = Color.FromArgb(20, 23, 26);
        ForeColor = Color.White;

        var heading = new Label
        {
            Text = "COURT 19   ·   Tradução PT-BR",
            Font = new Font("Segoe UI Semibold", 20F, FontStyle.Bold),
            ForeColor = Color.FromArgb(232, 168, 73),
            AutoSize = true,
            Location = new Point(28, 22)
        };
        Controls.Add(heading);

        var intro = new Label
        {
            Text = "Escolha a pasta do seu dump e onde ficará o mod. O jogo original não será alterado.",
            ForeColor = Color.FromArgb(205, 211, 216),
            AutoSize = true,
            Location = new Point(30, 67)
        };
        Controls.Add(intro);

        AddField("1. Pasta do dump NBA LIVE 19 (CUSA11355)", _dump, "Localizar…", 115, BrowseDump);
        AddField("2. Pasta do mod (criada automaticamente ao lado do dump)", _mod, null, 205, null);
        _mod.ReadOnly = true;
        _dump.TextChanged += (_, _) => UpdateModPathFromDump();

        var note = new Label
        {
            Text = "O shadPS4 lê mods somente na pasta ao lado do dump com o sufixo “-mods”. O instalador define esse caminho e cria data\\kettle\\loc nele.",
            ForeColor = Color.FromArgb(168, 180, 190),
            AutoSize = false,
            Size = new Size(700, 42),
            Location = new Point(30, 282)
        };
        Controls.Add(note);

        _install.Text = "Extrair e instalar tradução";
        _install.Font = new Font("Segoe UI Semibold", 11F, FontStyle.Bold);
        _install.BackColor = Color.FromArgb(194, 91, 27);
        _install.ForeColor = Color.White;
        _install.FlatStyle = FlatStyle.Flat;
        _install.FlatAppearance.BorderColor = Color.FromArgb(238, 153, 65);
        _install.Size = new Size(265, 44);
        _install.Location = new Point(30, 331);
        _install.Click += async (_, _) => await InstallAsync();
        Controls.Add(_install);

        _restore.Text = "Restaurar original";
        _restore.Font = new Font("Segoe UI Semibold", 10F, FontStyle.Bold);
        _restore.BackColor = Color.FromArgb(47, 54, 60);
        _restore.ForeColor = Color.White;
        _restore.FlatStyle = FlatStyle.Flat;
        _restore.FlatAppearance.BorderColor = Color.FromArgb(93, 105, 114);
        _restore.Size = new Size(190, 44);
        _restore.Location = new Point(310, 331);
        _restore.Click += (_, _) => RemoveModTranslation();
        Controls.Add(_restore);

        _status.Text = "Pronto para instalar.";
        _status.ForeColor = Color.FromArgb(191, 205, 215);
        _status.AutoSize = true;
        _status.AutoSize = false;
        _status.Size = new Size(420, 36);
        _status.Location = new Point(30, 382);
        Controls.Add(_status);

        _progress.Style = ProgressBarStyle.Marquee;
        _progress.MarqueeAnimationSpeed = 24;
        _progress.Visible = false;
        _progress.Size = new Size(700, 7);
        _progress.Location = new Point(30, 425);
        Controls.Add(_progress);

        _log.ReadOnly = true;
        _log.BorderStyle = BorderStyle.FixedSingle;
        _log.BackColor = Color.FromArgb(29, 33, 37);
        _log.ForeColor = Color.FromArgb(225, 230, 234);
        _log.Font = new Font("Segoe UI", 9.5F);
        _log.Location = new Point(30, 447);
        _log.Size = new Size(700, 150);
        _log.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
        _log.Text = "Aguardando a seleção das pastas.";
        Controls.Add(_log);
    }

    private void AddField(string label, TextBox box, string? buttonText, int top, EventHandler? browse)
    {
        Controls.Add(new Label
        {
            Text = label,
            ForeColor = Color.FromArgb(225, 230, 234),
            AutoSize = true,
            Location = new Point(30, top)
        });
        box.Location = new Point(30, top + 25);
        box.Size = new Size(buttonText is null ? 700 : 575, 30);
        box.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
        box.BackColor = Color.FromArgb(38, 43, 48);
        box.ForeColor = Color.White;
        box.BorderStyle = BorderStyle.FixedSingle;
        Controls.Add(box);
        if (buttonText is null || browse is null) return;
        var button = new Button
        {
            Text = buttonText,
            Location = new Point(620, top + 22),
            Size = new Size(110, 34),
            Anchor = AnchorStyles.Top | AnchorStyles.Right,
            BackColor = Color.FromArgb(47, 54, 60),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat
        };
        button.FlatAppearance.BorderColor = Color.FromArgb(93, 105, 114);
        button.Click += browse;
        Controls.Add(button);
    }

    private void BrowseDump(object? sender, EventArgs e)
    {
        using var dialog = new FolderBrowserDialog
        {
            Description = "Selecione a pasta do dump NBA LIVE 19 (CUSA11355).",
            UseDescriptionForTitle = true,
            ShowNewFolderButton = false
        };
        if (Directory.Exists(_dump.Text)) dialog.SelectedPath = _dump.Text;
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        _dump.Text = dialog.SelectedPath;
    }

    private void UpdateModPathFromDump()
    {
        var dump = _dump.Text.Trim().Trim('"');
        if (string.IsNullOrWhiteSpace(dump))
        {
            _mod.Clear();
            return;
        }
        var normalized = dump.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var dumpName = Path.GetFileName(normalized);
        _mod.Text = string.IsNullOrWhiteSpace(dumpName) ? string.Empty :
            Path.Combine(Directory.GetParent(normalized)?.FullName ?? normalized, dumpName + "-mods");
    }

    private async Task InstallAsync()
    {
        if (_running) return;
        var dump = _dump.Text.Trim().Trim('"');
        var mod = _mod.Text.Trim().Trim('"');
        if (!Directory.Exists(dump))
        {
            MessageBox.Show(this, "Localize a pasta do dump CUSA11355 primeiro.", "Pasta do jogo", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }
        if (string.IsNullOrWhiteSpace(mod))
        {
            MessageBox.Show(this, "Escolha onde ficará a pasta do mod.", "Pasta do mod", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }
        var expectedMod = Path.Combine(Directory.GetParent(dump)?.FullName ?? dump,
            Path.GetFileName(dump.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)) + "-mods");
        if (!string.Equals(Path.GetFullPath(mod).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                           Path.GetFullPath(expectedMod).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                           StringComparison.OrdinalIgnoreCase))
        {
            MessageBox.Show(this, "O shadPS4 procura a tradução somente nesta pasta ao lado do dump:\n\n" + expectedMod +
                "\n\nSelecione novamente a pasta CUSA11355 para preencher o caminho correto.",
                "Pasta do mod", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }
        var node = Path.Combine(AppContext.BaseDirectory, "node", "node.exe");
        var script = Path.Combine(AppContext.BaseDirectory, "apply-ptbr.mjs");
        if (!File.Exists(node) || !File.Exists(script))
        {
            MessageBox.Show(this, "Estão faltando arquivos do instalador. Extraia o conteúdo completo do ZIP antes de abrir.", "Instalador incompleto", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        _running = true;
        _install.Enabled = false;
        _progress.Visible = true;
        _status.Text = "Extraindo e preparando os textos…";
        _log.Clear();

        try
        {
            var start = new ProcessStartInfo
            {
                FileName = node,
                WorkingDirectory = AppContext.BaseDirectory,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            start.ArgumentList.Add(script);
            start.ArgumentList.Add("--dump");
            start.ArgumentList.Add(dump);
            start.ArgumentList.Add("--out");
            start.ArgumentList.Add(mod);

            using var process = new Process { StartInfo = start, EnableRaisingEvents = true };
            process.OutputDataReceived += (_, e) => AppendLog(e.Data);
            process.ErrorDataReceived += (_, e) => AppendLog(e.Data);
            if (!process.Start()) throw new InvalidOperationException("O processo de instalação não iniciou.");
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            await process.WaitForExitAsync();

            if (process.ExitCode == 0)
            {
                _status.Text = "Tradução instalada.";
                var result = Path.Combine(mod, "data", "kettle", "loc", "eng_us.db");
                AppendLog("Arquivo criado: " + result);
                MessageBox.Show(this,
                    "A tradução PT-BR foi instalada com sucesso.\n\nPasta do mod:\n" + mod +
                    "\n\nEsta é a pasta de mod reconhecida automaticamente pelo shadPS4. Reinicie o jogo para carregar a tradução.",
                    "Instalação concluída", MessageBoxButtons.OK, MessageBoxIcon.Information);
                if (MessageBox.Show(this, "Deseja abrir a pasta do mod?", "Abrir pasta", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
                    Process.Start(new ProcessStartInfo("explorer.exe", mod) { UseShellExecute = true });
            }
            else
            {
                _status.Text = "A instalação não foi concluída.";
                MessageBox.Show(this, "Não foi possível concluir. Veja a mensagem de erro exibida na área de detalhes da janela.", "Falha na instalação", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        catch (Exception ex)
        {
            _status.Text = "A instalação não foi concluída.";
            AppendLog(ex.Message);
            MessageBox.Show(this, ex.Message, "Falha na instalação", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            _running = false;
            _install.Enabled = true;
            _progress.Visible = false;
        }
    }

    private void RemoveModTranslation()
    {
        if (_running) return;
        var dump = _dump.Text.Trim().Trim('"');
        var mod = _mod.Text.Trim().Trim('"');
        if (!Directory.Exists(dump) || string.IsNullOrWhiteSpace(mod))
        {
            MessageBox.Show(this, "Localize primeiro a pasta do dump CUSA11355.", "Restaurar original", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        var expectedMod = Path.Combine(Directory.GetParent(dump)?.FullName ?? dump,
            Path.GetFileName(dump.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)) + "-mods");
        if (!string.Equals(Path.GetFullPath(mod).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                           Path.GetFullPath(expectedMod).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                           StringComparison.OrdinalIgnoreCase))
        {
            MessageBox.Show(this, "O caminho do mod não corresponde à pasta -mods deste dump.", "Caminho inválido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        var locale = Path.Combine(mod, "data", "kettle", "loc");
        var translatedDb = Path.Combine(locale, "eng_us.db");
        if (!File.Exists(translatedDb))
        {
            MessageBox.Show(this, "Não encontrei o banco PT-BR neste caminho. Nada foi apagado.", "Tradução não encontrada", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        var answer = MessageBox.Show(this,
            "Remover a tradução PT-BR e restaurar os idiomas originais do jogo?\n\n" +
            "O arquivo da tradução e os backups criados pelo instalador serão apagados da pasta -mods. O dump do jogo não será alterado.\n\n" +
            "Arquivos que não pertencem ao instalador serão preservados.",
            "Confirmar restauração", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
        if (answer != DialogResult.Yes) return;

        try
        {
            File.Delete(translatedDb);
            foreach (var backup in Directory.GetFiles(locale, "eng_us.db.backup-*.bak"))
                File.Delete(backup);
            foreach (var backup in Directory.GetFiles(locale, "eng_us.db.before-restore-*.bak"))
                File.Delete(backup);

            PruneEmptyDirectories(locale, mod);
            _status.Text = Directory.Exists(mod) ? "Tradução removida; outros arquivos do mod foram mantidos." : "Jogo restaurado aos idiomas originais.";
            _log.AppendText("Tradução PT-BR removida. O dump permaneceu intacto." + Environment.NewLine);
            MessageBox.Show(this,
                Directory.Exists(mod)
                    ? "A tradução foi removida. A pasta -mods foi mantida porque ainda contém outros arquivos."
                    : "Tradução removida. A pasta -mods vazia também foi apagada. Reinicie o jogo para carregar o idioma original.",
                "Restauração concluída", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            _status.Text = "Não foi possível remover a tradução.";
            _log.AppendText("Erro: " + ex.Message + Environment.NewLine);
            MessageBox.Show(this, ex.Message, "Falha ao restaurar", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private static void PruneEmptyDirectories(string start, string modRoot)
    {
        var current = new DirectoryInfo(start);
        var root = Path.GetFullPath(modRoot).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        while (current.Exists && current.GetFileSystemInfos().Length == 0)
        {
            var currentFull = current.FullName.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            if (!currentFull.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(currentFull, root, StringComparison.OrdinalIgnoreCase))
                break;
            var parent = current.Parent;
            current.Delete();
            if (string.Equals(currentFull, root, StringComparison.OrdinalIgnoreCase)) break;
            if (parent is null) break;
            current = parent;
        }
    }

    private void AppendLog(string? line)
    {
        if (string.IsNullOrWhiteSpace(line)) return;
        if (InvokeRequired) { BeginInvoke(() => AppendLog(line)); return; }
        _log.AppendText(line + Environment.NewLine);
        _log.SelectionStart = _log.TextLength;
        _log.ScrollToCaret();
    }
}

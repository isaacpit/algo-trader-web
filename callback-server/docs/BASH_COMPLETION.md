# Bash Completion for AlgoTraders Development Scripts

This directory includes bash completion support for all development scripts, making them much easier to use with tab completion.

## 🎯 Supported Scripts

### `./dev.sh` - Main Development Script

**Commands with completion:**

- `local` - Start LocalStack development environment
- `aws` - Switch to AWS production environment
- `start` - Start the callback server
- `stop` - Stop all services
- `restart` - Restart all services
- `logs [service]` - Show logs (with service name completion)
- `status` - Show service status
- `populate [debug]` - Populate database (with debug flag completion)
- `tables [debug]` - List tables (with debug flag completion)
- `clean` - Clean up all data and containers
- `help` - Show help message

**Service names for `logs` command:**

- `localstack`
- `dynamodb-admin`
- `callback-server`

### `./view_localstack_logs.sh` - LocalStack Log Viewer

**Flags with completion:**

- `-f, --follow` - Follow logs in real-time
- `-d, --dynamodb` - Filter for DynamoDB requests only
- `-r, --requests` - Filter for request bodies only
- `-a, --all` - Show all logs (default)
- `-c, --clear` - Clear log files
- `-h, --help` - Show help message
- `info` - Show log information

### `./fix_localstack_logs.sh` - LocalStack Log Fix Utility

- No additional arguments (completion registered for consistency)

## 🚀 Installation

### Option 1: Temporary (Current Session Only)

```bash
source dev_completion.sh
```

### Option 2: Permanent Installation

```bash
./dev_completion.sh install
```

This will:

1. Copy the completion script to `~/.bash_completion.d/`
2. Add a source line to your `~/.bashrc`
3. Enable completion for all future terminal sessions

## 💡 Usage Examples

### Basic Tab Completion

```bash
# Type and press TAB to see all commands
./dev.sh [TAB]

# Type partial command and press TAB to complete
./dev.sh lo[TAB]  # Completes to "local"
./dev.sh st[TAB]  # Shows "start", "status", "stop"
```

### Service Name Completion

```bash
# Type logs command and press TAB to see available services
./dev.sh logs [TAB]  # Shows: localstack, dynamodb-admin, callback-server

# Partial service name completion
./dev.sh logs local[TAB]  # Completes to "localstack"
```

### Flag Completion for Log Viewer

```bash
# See all available flags
./view_localstack_logs.sh [TAB]

# Complete partial flags
./view_localstack_logs.sh -f[TAB]  # Completes to "-f" or "--follow"
./view_localstack_logs.sh --dyn[TAB]  # Completes to "--dynamodb"
```

### Debug Flag Completion

```bash
# Complete debug flag for populate and tables commands
./dev.sh populate [TAB]  # Shows "debug"
./dev.sh tables [TAB]    # Shows "debug"
```

## 🔧 How It Works

The completion script (`dev_completion.sh`) uses bash's built-in completion system:

1. **Command Detection**: Recognizes which script is being completed
2. **Context-Aware**: Provides different completions based on the current command
3. **Multi-Level**: Supports completion for both commands and their arguments
4. **Intelligent Filtering**: Only shows relevant options for each context

### Completion Functions

- `_dev_completion()` - Handles `dev.sh` command and argument completion
- `_view_localstack_logs_completion()` - Handles log viewer flag completion
- `_fix_localstack_logs_completion()` - Registered for consistency

## 🛠️ Customization

To add new commands or modify completions:

1. Edit `dev_completion.sh`
2. Update the relevant completion function
3. Add new commands to the `commands` variable
4. Re-source the script: `source dev_completion.sh`

### Adding New Commands

```bash
# In _dev_completion function, update:
local commands="local aws start stop restart logs status populate tables clean help yournewcommand"
```

### Adding New Flags

```bash
# In _view_localstack_logs_completion function, update:
local flags="-f --follow -d --dynamodb -r --requests -a --all -c --clear -h --help info --yournewflag"
```

## 🐛 Troubleshooting

### Completion Not Working

1. Make sure you've sourced the script: `source dev_completion.sh`
2. Check if bash completion is enabled in your system
3. Verify the script is executable: `chmod +x dev_completion.sh`

### Completion Shows Wrong Options

1. Re-source the script after making changes
2. Check that you're in the correct directory
3. Verify the script path in the completion registration

### Permanent Installation Issues

1. Check if `~/.bash_completion.d/` directory exists
2. Verify `~/.bashrc` is being sourced by your terminal
3. Restart your terminal or run `source ~/.bashrc`

## 📋 Testing

To test completion functionality:

```bash
# Enable completion
source dev_completion.sh

# Test command completion
./dev.sh [TAB][TAB]

# Test service completion
./dev.sh logs [TAB][TAB]

# Test flag completion
./view_localstack_logs.sh -[TAB][TAB]

# Test debug flag completion
./dev.sh populate [TAB][TAB]
```

## 🎉 Benefits

- **Faster Development**: No need to remember exact command names
- **Reduced Errors**: Tab completion prevents typos
- **Better Discovery**: See all available options at a glance
- **Consistent Experience**: Works across all development scripts
- **Context Awareness**: Only shows relevant options for each command

Enjoy faster and more efficient development with tab completion! 🚀

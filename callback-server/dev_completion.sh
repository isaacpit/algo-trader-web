#!/bin/bash

# Bash completion for AlgoTraders development scripts
# Usage: source dev_completion.sh or add to your ~/.bashrc

_dev_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Main commands
    local commands="local aws start stop restart logs status populate tables clean help"

    # Service names for logs command
    local services="localstack dynamodb-admin callback-server"

    # Flags for populate and tables commands
    local debug_flag="debug"

    # If we're completing the first argument (command)
    if [[ ${COMP_CWORD} == 1 ]]; then
        COMPREPLY=($(compgen -W "${commands}" -- ${cur}))
        return 0
    fi

    # Handle second argument based on first argument
    case "${COMP_WORDS[1]}" in
        logs)
            # For logs command, suggest service names
            if [[ ${COMP_CWORD} == 2 ]]; then
                COMPREPLY=($(compgen -W "${services}" -- ${cur}))
            fi
            ;;
        populate)
            # For populate command, suggest debug flag
            if [[ ${COMP_CWORD} == 2 ]]; then
                COMPREPLY=($(compgen -W "${debug_flag}" -- ${cur}))
            fi
            ;;
        tables)
            # For tables command, suggest debug flag
            if [[ ${COMP_CWORD} == 2 ]]; then
                COMPREPLY=($(compgen -W "${debug_flag}" -- ${cur}))
            fi
            ;;
        *)
            # No additional completions for other commands
            ;;
    esac
}

_view_localstack_logs_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Available flags for view_localstack_logs.sh
    local flags="-f --follow -d --dynamodb -r --requests -a --all -c --clear -h --help info"

    # Complete with available flags
    COMPREPLY=($(compgen -W "${flags}" -- ${cur}))
}

_fix_localstack_logs_completion() {
    # No additional arguments needed for fix script
    return 0
}

# Register completion functions
complete -F _dev_completion ./dev.sh
complete -F _dev_completion dev.sh

complete -F _view_localstack_logs_completion ./view_localstack_logs.sh
complete -F _view_localstack_logs_completion view_localstack_logs.sh

complete -F _fix_localstack_logs_completion ./fix_localstack_logs.sh
complete -F _fix_localstack_logs_completion fix_localstack_logs.sh

# Function to install completion permanently
install_completion() {
    local completion_dir="$HOME/.bash_completion.d"
    local completion_file="$completion_dir/algotraders_dev_completion"

    echo "🔧 Installing bash completion permanently..."

    # Create completion directory if it doesn't exist
    mkdir -p "$completion_dir"

    # Copy this script to the completion directory
    cp "$(basename "$0")" "$completion_file"

    # Add source line to .bashrc if not already present
    local bashrc="$HOME/.bashrc"
    local source_line="source $completion_file"

    if [[ -f "$bashrc" ]] && ! grep -q "$source_line" "$bashrc"; then
        echo "" >> "$bashrc"
        echo "# AlgoTraders development script completion" >> "$bashrc"
        echo "$source_line" >> "$bashrc"
        echo "✅ Added completion to ~/.bashrc"
    fi

    echo "✅ Bash completion installed permanently!"
    echo "💡 Restart your terminal or run 'source ~/.bashrc' to activate"
}

# Check if being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Being executed directly - offer to install
    echo "🎯 AlgoTraders Development Scripts Bash Completion"
    echo ""
    echo "This script provides tab completion for:"
    echo "  • dev.sh - Main development script"
    echo "  • view_localstack_logs.sh - LocalStack log viewer"
    echo "  • fix_localstack_logs.sh - LocalStack log fix utility"
    echo ""
    echo "Options:"
    echo "  1. Source temporarily: source dev_completion.sh"
    echo "  2. Install permanently: ./dev_completion.sh install"
    echo ""

    if [[ "$1" == "install" ]]; then
        install_completion
    else
        echo "💡 Run './dev_completion.sh install' to install permanently"
        echo "💡 Or run 'source dev_completion.sh' to enable for this session"
    fi
else
    # Being sourced - enable completion
    echo "🎯 Bash completion for AlgoTraders development scripts enabled!"
    echo ""
    echo "📋 Available commands for ./dev.sh:"
    echo "  local, aws, start, stop, restart, logs [service], status"
    echo "  populate [debug], tables [debug], clean, help"
    echo ""
    echo "📋 Available flags for ./view_localstack_logs.sh:"
    echo "  -f/--follow, -d/--dynamodb, -r/--requests, -a/--all"
    echo "  -c/--clear, -h/--help, info"
    echo ""
    echo "💡 Try typing './dev.sh ' + TAB to see available commands!"
    echo "💡 Try typing './view_localstack_logs.sh ' + TAB to see available flags!"
fi

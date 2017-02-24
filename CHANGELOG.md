# MicroStrategy Log Parser - Changelog

- Issues & Enhancements: https://github.com/tiagosiebler/MSTRWebLogParser/issues
- Access the log parser: https://tiagosiebler.github.io/MSTRWebLogParser/build/

## 2017-Feb-24
- Refactored data processing logic into more generic functions within dedicated data parsing factory.
- Added method to detect type of log file.
- Fixed 'left key' navigation not triggering previous log message when inspecting log.
- Added basic Kernel XML API parsing.
- Added error handling for Kernel API parser, since the log format isn't always predictable and may need further tuning. If an unexpected message couldn't be parsed in the log file, it'll throw a warning with details.
- Added error handling to web log parsing process. If something doesn't parse properly, you'll know about it.
- Fixed issue placing dragging area over error view.
- Fixed escaping of invalid XML characters when parsing web logs, causing some web logs to fail the parsing process.
- Updated README.
- Fixed wrong sorting after using larger datasets (Issue #24).
- Fixed left/right keyboard navigation when inspecting kernel log message.
- Fixed clash in resizing action between both log tables.
- Removed blue outline that remains after clicking button (Issue #19).

## 2017-Feb-22
- Updated help section of parser.
- Added quick-links to changelog.
- Updated README.

## 2017-Feb-21
- Added a changelog.
- Define charset at start of toaster.scss, to prevent charset clash in author name & copyright during compilation.
- Cleared https redirect.
- Removed unused sidebar directive.
- Cleaned up scope references.
- Fixed alignment of header buttons in web log message list (Issue #12).
- Added states to resize & search buttons in web log message list.
- Changed row marking to use simple row colouring.
- Dropped networking 'Data' class since there are no planned network requests, and to avoid confusion.
- Added ID column for log message number, so sorting can be reset to default if ever changed.
- Added 'on hover' helper text for columns, as easy access to column definition.
- Prepare a processing factory to move logic from single controller to dedicated factory (Issue #15).
- Refactored logstable as logsWeb, in preparation for additional log formats.
- Refactored mainform -> startform for clarity in source.
- Refactored logView -> inspectWebLog, since we'll likely have different inspectors per log type.
- Row marking now only works with the dedicated flag button (Issue #18)
- Prevent log viewer/inspector from opening when double clicking on action buttons, avoiding conflicting actions.
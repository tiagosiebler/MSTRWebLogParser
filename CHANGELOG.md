# MicroStrategy Log Parser - Changelog

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
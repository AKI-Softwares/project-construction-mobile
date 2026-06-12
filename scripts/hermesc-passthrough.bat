@echo off
REM Passthrough hermesc: copies the JS bundle to the output path without bytecode compilation.
REM win64 hermesc 0.12.0 (RN 0.66 era) cannot compile ES2022 private class fields.
REM The Hermes runtime JIT-compiles plain JS fine, so we skip ahead-of-time compilation.
REM
REM CMD.EXE treats '=' as a token separator, so '-max-diagnostic-width=80' splits into
REM two tokens. Actual positional args received:
REM   %1  -w
REM   %2  -emit-binary
REM   %3  -max-diagnostic-width
REM   %4  80
REM   %5  -out
REM   %6  <output.hbc>   (relative to project root)
REM   %7  <input.bundle> (relative to project root)

copy /Y "%~7" "%~6" > nul
exit /B %ERRORLEVEL%

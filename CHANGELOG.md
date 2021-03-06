# 3.1.5

- Fixed tests after `expire-unused-keys` update.

# 3.1.4

- Bumped up the timeout on a test, because it was failing.

# 3.1.3

- Added test for an array of buffer separators. (Fixes [#5](https://github.com/ArtskydJ/tiny-level-ttl/issues/5).)

# 3.1.2

- Added test for buffer separators. (Fixes [#5](https://github.com/ArtskydJ/tiny-level-ttl/issues/5).)

# 3.1.1

- TTL shuts down nicely when the database closes.
- Sped up tests.

# 3.1.0

- Added `separator` option.

# 3.0.0

- Added support for `level-spaces@2`
- The check for whether a key is in a sub level is more thorough.
- Breaking changes: Keys with `'\x00'`, `'\xff'`, or `'~'` in their name are not supported. (In 3.1.0+, they are supported by passing in a `separator` that overrides the defaults.)

# 2.0.3

- Updated `.travis.yml`.

# 2.0.2

- Updated `.gitignore`.

# 2.0.1

- Removed unused dependency.

# 2.0.0

- Added support for `level-spaces@1`.
- Breaking changes: none.

# 1.1.0

- Internally using `level-spaces` instead of `level-sublevel`.

# 1.0.0

- Republished v0.2.0 as v1.0.0

# 0.2.0

- Added tests.

# 0.1.0

- Added `refreshOnGet` option.

# 0.0.3

- Instead of multiple options being passed in, and options object is passed in.
- Added `.travis.yml`.

# 0.0.2

- Added tests.

# 0.0.1

- Initial version.
- Added support for `level-sublevel`.

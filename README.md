# CLIC Bookkeeping

## Getting started:
1. Clone the repo.
2. Run `php create-config.php {version}` - *use 9.9.9 for dev testing*

JS can be modified directly within `/www/js`. 

To modify HTML, you'll need to edit `/configs/{theme}/index.html` and then run `php switch-config.php {theme}` to test.

To modify config.xml, you'll need to edit `base-config.xml` and then run step two again.

## Generating a build zip:
`php build.php {version}`

You can then upload the generated files to **PhoneGap Build** to build for Android and iOS.
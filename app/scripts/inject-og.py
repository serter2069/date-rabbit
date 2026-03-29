#!/usr/bin/env python3
"""Inject OG meta tags into the static Expo export index.html."""
import sys

OG_TAGS = (
    '<meta name="description" content="DateRabbit connects seekers with companions'
    ' for memorable date experiences. Find, book, and enjoy amazing dates.">'
    '<meta property="og:title" content="DateRabbit \u2014 Find Your Perfect Date">'
    '<meta property="og:description" content="Connect with companions for memorable date experiences.">'
    '<meta property="og:image" content="https://daterabbit.smartlaunchhub.com/og-image.png">'
    '<meta property="og:url" content="https://daterabbit.smartlaunchhub.com">'
    '<meta property="og:type" content="website">'
    '<meta name="twitter:card" content="summary_large_image">'
    '<meta name="twitter:title" content="DateRabbit">'
    '<meta name="twitter:description" content="Connect with companions for memorable date experiences.">'
    '<meta name="twitter:image" content="https://daterabbit.smartlaunchhub.com/og-image.png">'
)


def inject(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    html = html.replace('<title>DateRabbit</title>', '<title>DateRabbit \u2014 Find Your Perfect Date</title>')
    html = html.replace('</head>', OG_TAGS + '</head>', 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'OG tags injected into {path}')


if __name__ == '__main__':
    inject(sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html')

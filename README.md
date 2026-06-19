# Saint Meridian teaser site

Static one-page site for `saintmeridian.com`. It is designed for GitHub Pages and has no build step.

## Preview

Serve this directory with any local static server, then open `index.html` through that server.

## Email signup

The form is intentionally safe by default: it does not pretend to capture submissions until a form endpoint is configured.

After creating a form with the selected email provider, add its HTTPS endpoint to the form in `index.html`:

```html
<form class="signup-form" data-signup-form data-endpoint="https://provider.example/your-form" novalidate>
```

The existing JavaScript submits standard form data and expects a JSON response.

## GitHub Pages

Publish the contents of this directory at the root of the Pages site. The included `CNAME` sets the custom domain to `saintmeridian.com`.

const fs = require('fs').promises;
const path = require('path');

// Basic HTML template
const template = (article) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.name} - Art in the Cage of Digital Reproduction</title>
    <meta name="description" content="${article.occupation || 'Article by ' + article.name}">
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <article>
        <header>
            <h1>${article.name}</h1>
            ${article.occupation ? `<h2>${article.occupation}</h2>` : ''}
            <time datetime="${article.date}">${article.date}</time>
        </header>
        
        ${article.image ? `
        <figure>
            <img src="../${article.image.path}" alt="${article.image.caption || article.name}">
            ${article.image.caption ? `<figcaption>${article.image.caption}</figcaption>` : ''}
        </figure>
        ` : ''}
        
        <div class="content">
            ${article.content}
        </div>
        
        ${article.bio ? `<div class="bio">${article.bio}</div>` : ''}
    </article>
</body>
</html>
`;

async function generateStaticPages() {
    try {
        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'public', 'article');
        await fs.mkdir(outputDir, { recursive: true });

        // Read all JSON files from articles directory
        const articlesDir = path.join(__dirname, 'articles');
        const files = await fs.readdir(articlesDir);
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                // Read and parse JSON file
                const jsonContent = await fs.readFile(path.join(articlesDir, file), 'utf8');
                const article = JSON.parse(jsonContent);
                
                // Generate HTML
                const html = template(article);
                
                // Write HTML file
                const outputPath = path.join(outputDir, `${article.id}.html`);
                await fs.writeFile(outputPath, html);
                
                console.log(`Generated ${outputPath}`);
            }
        }

        // Generate sitemap.xml
        const sitemapContent = await generateSitemap(files);
        await fs.writeFile(path.join(__dirname, 'public', 'sitemap.xml'), sitemapContent);
        console.log('Generated sitemap.xml');

    } catch (error) {
        console.error('Error generating static pages:', error);
    }
}

async function generateSitemap(files) {
    const urls = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const id = file.replace('.json', '');
            return `
    <url>
        <loc>https://artinthecageofdigitalreproduction.org/article/${id}.html</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>`;
        })
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
        <loc>https://artinthecageofdigitalreproduction.org/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>${urls}
</urlset>`;
}

generateStaticPages();
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
  
async function handleRequest(request) {
    try {
        const url = new URL(request.url)
        const searchParams = new URLSearchParams(url.search)
        const pathname = url.pathname

        if (pathname === '/filecode') {
            const fileCode = searchParams.get('file_code')
            if (!fileCode) {
                return new Response('File code is required', { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } })
            }
            const videoDetail = await fetchVideoDetail(fileCode)
            const html = generateDetailHTML(videoDetail)
            return new Response(html, {
                headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' },
            })
        } else {
            const maxResults = parseInt(searchParams.get('max_results')) || 20
            const query = searchParams.get('query') || ''

            console.log(`Fetching data, Max results: ${maxResults}, Query: ${query}`)
            const videos = await fetchDoodAPI(maxResults, query)
            const html = generateHTML(videos)
            return new Response(html, {
                headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' },
            })
        }
    } catch (error) {
        console.error('Error in handleRequest:', error)
        return new Response('Internal Server Error', { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } })
    }
}
  
async function fetchDoodAPI(maxResults, query) {
    try {
        const url = `https://doodapi.com/api/search/videos?key=112623ifbcbltzajwjrpjx&search_term=${encodeURIComponent(query)}`
        const response = await fetch(url)
        const data = await response.json()

        console.log('Fetched DoodAPI results')
        if (data.result && Array.isArray(data.result)) {
            return data.result.slice(0, maxResults)
        } else {
            console.error('Unexpected API response structure:', data)
            return []
        }
    } catch (error) {
        console.error('Error in fetchDoodAPI:', error)
        throw error
    }
}
  
async function fetchVideoDetail(fileCode) {
    try {
        const url = `https://doodapi.com/api/folder/list?key=112623ifbcbltzajwjrpjx&file_code=${fileCode}`
        const response = await fetch(url)
        const data = await response.json()

        console.log('Fetched video detail')
        return data.result
    } catch (error) {
        console.error('Error in fetchVideoDetail:', error)
        throw error
    }
}
  
function generateHTML(videos) {
    return videos.map(video => `
      <div class="bg-white p-4 rounded shadow">
        <img src="${video.splash_img !== 'https://odw7bf.dood.video/404.html' ? video.splash_img : (video.single_img !== 'https://odw7bf.dood.video/404.html' ? video.single_img : 'https://odw7bf.dood.video/404.html')}" alt="${video.title}" class="w-full h-48 object-cover rounded">
        <h2 class="text-xl font-bold mt-2">${video.title}</h2>
        <p class="text-gray-700">Length: ${video.length} minutes</p>
        <p class="text-gray-500 text-sm">Views: ${video.views}</p>
        <p class="text-gray-500 text-sm">Uploaded: ${video.uploaded}</p>
        <a href="/detail.html?file_code=${video.file_code}" class="text-blue-500 hover:underline">Watch on Dood</a>
      </div>
    `).join('')
}
  
function generateDetailHTML(videoDetail) {
    return `
      <h1 class="text-2xl font-bold mb-4">${videoDetail.title}</h1>
      <img src="${videoDetail.splash_img}" alt="${videoDetail.title}" class="w-full h-48 object-cover rounded">
      <p class="text-gray-700 mt-4">Length: ${videoDetail.length} minutes</p>
      <p class="text-gray-500 text-sm">Views: ${videoDetail.views}</p>
      <p class="text-gray-500 text-sm">Uploaded: ${videoDetail.uploaded}</p>
      <a href="${videoDetail.download_url}" class="text-blue-500 hover:underline">Download</a>
    `
}
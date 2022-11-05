let posts = [
    {
        name : 'Stanislav Petrov',
        img : '/assets/img_temp/img1.jpg',
        dateID : '1667598027425',
        message : 'Test!!!'
    },
    {
        name : 'Ljubljana Todorova',
        img : '/assets/img_temp/img2.jpg',
        dateID : '1667598027425',
        message : 'Test!!!'
    }
]

const profile = 1;

const postsArea = document.getElementById("posts-area");
const btn = document.getElementById("btn");

btn.onclick = function() {
    let newPost = document.createElement("div");
    newPost.innerHTML =
        '<div class="post" id="' + Date() +
        '"><div class="post-header"><p>' + posts[profile].name +
        '</p><p>' + Date() +
        '</p></div><div class="post-content"><img class="author-img" src="' + posts[profile].img +
        '"><p class="post-text">' + posts[profile].message +
        '</p></div></div>';

    postsArea.append(newPost);
    console.log(profile);
};
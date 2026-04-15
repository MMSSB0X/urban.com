import { auth, db } from "./firebase.js";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, serverTimestamp, getDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getProductById } from "./products.js";

let currentUser = null;
let currentUserName = "Urban Farmer";
let postToDeleteId = null;

const activeCommentListeners = {};

function timeAgo(date) {
    if (!date) return "Just now";
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}

function parseText(text) {
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // 1. Process Hashtags FIRST (Commented out to disable)
    /*
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    safeText = safeText.replace(hashtagRegex, function(match, tag) {
        return `<a href="product-list.html?q=${tag}" class="hashtag" onclick="event.stopPropagation();">#${tag}</a>`;
    });
    */

    // 2. Process Links SECOND
    const urlRegex = /(?<!href="|href=')(?:(?:https?:\/\/)|(?:www\.))[^\s<]+/gi;
    safeText = safeText.replace(urlRegex, function(url) {
        let href = url;
        if (!href.match('^https?://')) {
            href = 'http://' + href;
        }
        return `<a href="${href}" target="_blank" class="post-link">${url}</a>`;
    });

    return safeText;
}

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('posts-feed');
    
    // --- Modal DOM Elements ---
    const deleteModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    // --- Modal Event Listeners ---
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
        postToDeleteId = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (postToDeleteId) {
            deletePost(postToDeleteId);
            deleteModal.classList.remove('active');
            postToDeleteId = null; 
        }
    });

    // Close modal if user clicks outside the white box
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
            postToDeleteId = null;
        }
    });

    // Close dropdowns if clicking anywhere outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.post-header-actions')) {
            document.querySelectorAll('.post-dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            currentUserName = user.displayName;
            if (!currentUserName) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) currentUserName = userDoc.data().fullName;
                } catch (err) { console.log(err); }
            }
            initFeed(); 
        } else {
            window.location.href = "login.html";
        }
    });

    function initFeed() {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                feedContainer.innerHTML = `
                    <div style="text-align:center; padding: 4rem 1rem; background: var(--card-bg); border-radius: 1.5rem; border: 1px solid var(--card-border);">
                        <i class="ph-fill ph-plant text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3 style="font-weight: 800; color: var(--text-main);">No posts yet!</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">Be the first to plant a thought in the community.</p>
                    </div>`;
                return;
            }

            let newHtml = '';
            
            snapshot.forEach((docSnap) => {
                const post = docSnap.data();
                const postId = docSnap.id;
                
                const authorName = post.authorName || "Urban Farmer";
                const initial = authorName.charAt(0);
                const postDate = post.createdAt ? post.createdAt.toDate() : new Date();
                const parsedContent = parseText(post.content || "");
                
                const likes = post.likedBy || [];
                const likesCount = likes.length;
                const isLiked = currentUser && likes.includes(currentUser.uid);
                
                const saves = post.savedBy || [];
                const isSaved = currentUser && saves.includes(currentUser.uid);

                const commentsCount = post.commentsCount || 0;
                
                // Check if current user is the author to show delete button
                const isAuthor = currentUser && post.userId === currentUser.uid;
                let optionsHtml = '';

                if (isAuthor) {
                    optionsHtml = `
                        <div class="post-header-actions">
                            <button class="more-options-btn" data-id="${postId}">
                                <i class="ph-bold ph-dots-three"></i>
                            </button>
                            <div class="post-dropdown" id="dropdown-${postId}">
                                <button class="dropdown-item delete-post-btn" data-id="${postId}">
                                    <i class="ph-bold ph-trash"></i> Delete Post
                                </button>
                            </div>
                        </div>
                    `;
                }

                let productHtml = "";
                if (post.taggedProductId) {
                    const taggedProduct = getProductById(post.taggedProductId);
                    if (taggedProduct) {
                        productHtml = `
                            <a href="product.html?id=${taggedProduct.id}" class="tagged-product">
                                <img src="${taggedProduct.image}" alt="${taggedProduct.name}" onerror="this.src='https://via.placeholder.com/60'"/>
                                <div class="tagged-product-info">
                                    <h5>${taggedProduct.name}</h5>
                                    <p>EGP ${taggedProduct.price.toFixed(2)} • View Product <i class="ph-bold ph-arrow-right"></i></p>
                                </div>
                            </a>
                        `;
                    }
                }

                const existingPostEl = document.getElementById(`post-${postId}`);
                const isCommentsOpen = existingPostEl && existingPostEl.querySelector('.comments-section').classList.contains('active');
                const commentDisplay = isCommentsOpen ? 'active' : '';

                newHtml += `
                    <div class="post-card" id="post-${postId}">
                        <div class="post-header">
                            <div class="author-avatar">${initial}</div>
                            <div class="post-header-info">
                                <h4>${authorName}</h4>
                                <span><i class="ph-fill ph-clock"></i> ${timeAgo(postDate)}</span>
                            </div>
                            ${optionsHtml}
                        </div>
                        
                        <div class="post-content">${parsedContent}</div>
                        ${productHtml}
                        
                        <div class="post-stats">
                            <span>${likesCount} Likes</span>
                            <span>${commentsCount} Comments</span>
                        </div>
                        
                        <div class="post-actions">
                            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${postId}" data-liked="${isLiked}">
                                <i class="ph-heart ${isLiked ? 'ph-fill' : 'ph-bold'}"></i> ${isLiked ? 'Liked' : 'Like'}
                            </button>
                            <button class="action-btn comment-btn" data-id="${postId}">
                                <i class="ph-bold ph-chat-circle"></i> Comment
                            </button>

                        </div>
                        
                        <div class="comments-section ${commentDisplay}" id="comments-${postId}">
                            <div class="comments-list" id="comment-list-${postId}">
                                <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); padding: 1rem;">Loading comments...</div>
                            </div>
                            <div class="comment-input-wrapper">
                                <div class="my-avatar"><i class="ph-fill ph-user"></i></div>
                                <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." autocomplete="off"/>
                                <button class="send-comment-btn" data-id="${postId}"><i class="ph-bold ph-paper-plane-tilt"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                // newHtml += `
                //     <div class="post-card" id="post-${postId}">
                //         <div class="post-header">
                //             <div class="author-avatar">${initial}</div>
                //             <div class="post-header-info">
                //                 <h4>${authorName}</h4>
                //                 <span><i class="ph-fill ph-clock"></i> ${timeAgo(postDate)}</span>
                //             </div>
                //             ${optionsHtml}
                //         </div>
                        
                //         <div class="post-content">${parsedContent}</div>
                //         ${productHtml}
                        
                //         <div class="post-stats">
                //             <span>${likesCount} Likes</span>
                //             <span>${commentsCount} Comments</span>
                //         </div>
                        
                //         <div class="post-actions">
                //             <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${postId}" data-liked="${isLiked}">
                //                 <i class="ph-heart ${isLiked ? 'ph-fill' : 'ph-bold'}"></i> ${isLiked ? 'Liked' : 'Like'}
                //             </button>
                //             <button class="action-btn comment-btn" data-id="${postId}">
                //                 <i class="ph-bold ph-chat-circle"></i> Comment
                //             </button>
                //             <button class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-id="${postId}" data-saved="${isSaved}">
                //                 <i class="ph-bookmark-simple ${isSaved ? 'ph-fill' : 'ph-bold'}"></i> ${isSaved ? 'Saved' : 'Save'}
                //             </button>
                //         </div>
                        
                //         <div class="comments-section ${commentDisplay}" id="comments-${postId}">
                //             <div class="comments-list" id="comment-list-${postId}">
                //                 <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); padding: 1rem;">Loading comments...</div>
                //             </div>
                //             <div class="comment-input-wrapper">
                //                 <div class="my-avatar"><i class="ph-fill ph-user"></i></div>
                //                 <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." autocomplete="off"/>
                //                 <button class="send-comment-btn" data-id="${postId}"><i class="ph-bold ph-paper-plane-tilt"></i></button>
                //             </div>
                //         </div>
                //     </div>
                // `;
            });
            
            feedContainer.innerHTML = newHtml;

            document.querySelectorAll('.comments-section.active').forEach(section => {
                const pId = section.id.replace('comments-', '');
                loadComments(pId); 
            });
        });
    }

    feedContainer.addEventListener('click', async (e) => {
        if (!currentUser) return;

        // Toggle 3-dots dropdown
        const moreBtn = e.target.closest('.more-options-btn');
        if (moreBtn) {
            const postId = moreBtn.getAttribute('data-id');
            const dropdown = document.getElementById(`dropdown-${postId}`);
            
            // Close other open dropdowns first
            document.querySelectorAll('.post-dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active');
        }

        // Handle Delete Click (Opens Modal)
        const deleteBtn = e.target.closest('.delete-post-btn');
        if (deleteBtn) {
            const postId = deleteBtn.getAttribute('data-id');
            document.getElementById(`dropdown-${postId}`).classList.remove('active');
            
            postToDeleteId = postId;
            deleteModal.classList.add('active');
        }

        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const postId = likeBtn.getAttribute('data-id');
            const isLiked = likeBtn.getAttribute('data-liked') === 'true';
            const postRef = doc(db, "posts", postId);

            likeBtn.classList.toggle('liked');
            likeBtn.querySelector('i').classList.toggle('ph-fill');
            likeBtn.querySelector('i').classList.toggle('ph-bold');
            likeBtn.setAttribute('data-liked', !isLiked);
            likeBtn.innerHTML = `<i class="ph-heart ${!isLiked ? 'ph-fill' : 'ph-bold'}"></i> ${!isLiked ? 'Liked' : 'Like'}`;

            try {
                if (isLiked) await updateDoc(postRef, { likedBy: arrayRemove(currentUser.uid) });
                else await updateDoc(postRef, { likedBy: arrayUnion(currentUser.uid) });
            } catch (error) { console.error("Error updating like:", error); }
        }

        const saveBtn = e.target.closest('.save-btn');
        if (saveBtn) {
            const postId = saveBtn.getAttribute('data-id');
            const isSaved = saveBtn.getAttribute('data-saved') === 'true';
            const postRef = doc(db, "posts", postId);

            saveBtn.classList.toggle('saved');
            saveBtn.querySelector('i').classList.toggle('ph-fill');
            saveBtn.querySelector('i').classList.toggle('ph-bold');
            saveBtn.setAttribute('data-saved', !isSaved);
            saveBtn.innerHTML = `<i class="ph-bookmark-simple ${!isSaved ? 'ph-fill' : 'ph-bold'}"></i> ${!isSaved ? 'Saved' : 'Save'}`;

            try {
                if (isSaved) await updateDoc(postRef, { savedBy: arrayRemove(currentUser.uid) });
                else await updateDoc(postRef, { savedBy: arrayUnion(currentUser.uid) });
            } catch (error) { console.error("Error updating save:", error); }
        }

        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            const postId = commentBtn.getAttribute('data-id');
            const commentSection = document.getElementById(`comments-${postId}`);
            
            if (commentSection.classList.contains('active')) {
                commentSection.classList.remove('active');
                if(activeCommentListeners[postId]) {
                    activeCommentListeners[postId](); 
                    delete activeCommentListeners[postId];
                }
            } else {
                commentSection.classList.add('active');
                loadComments(postId); 
                
                setTimeout(() => {
                    const input = document.getElementById(`comment-input-${postId}`);
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }

        const sendBtn = e.target.closest('.send-comment-btn');
        if (sendBtn) {
            const postId = sendBtn.getAttribute('data-id');
            submitComment(postId);
        }
    });

    feedContainer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.id.startsWith('comment-input-')) {
            const postId = e.target.id.replace('comment-input-', '');
            submitComment(postId);
        }
    });

    async function submitComment(postId) {
        if (!currentUser) return;
        const inputEl = document.getElementById(`comment-input-${postId}`);
        const content = inputEl.value.trim();
        const sendBtn = document.querySelector(`.send-comment-btn[data-id="${postId}"]`);
        
        if (!content) return;

        try {
            inputEl.disabled = true;
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            await addDoc(collection(db, `posts/${postId}/comments`), {
                userId: currentUser.uid,
                authorName: currentUserName || "Urban Farmer",
                content: content,
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1) });
            inputEl.value = ''; 
            
            const listEl = document.getElementById(`comment-list-${postId}`);
            setTimeout(() => { listEl.scrollTop = listEl.scrollHeight; }, 100);

        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Failed to post comment.");
        } finally {
            inputEl.disabled = false;
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i>';
            inputEl.focus();
        }
    }

    function loadComments(postId) {
        if (activeCommentListeners[postId]) return;

        const commentsListEl = document.getElementById(`comment-list-${postId}`);
        const q = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                commentsListEl.innerHTML = `<div style="text-align: center; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); padding: 1rem;">Be the first to comment!</div>`;
                return;
            }

            let html = '';
            snapshot.forEach(docSnap => {
                const comment = docSnap.data();
                const initial = (comment.authorName || "U").charAt(0);
                const cDate = comment.createdAt ? comment.createdAt.toDate() : new Date();

                html += `
                    <div class="comment-item">
                        <div class="comment-avatar">${initial}</div>
                        <div class="comment-body">
                            <div class="comment-author">${comment.authorName || "Urban Farmer"}</div>
                            <div class="comment-text">${parseText(comment.content)}</div>
                            <span class="comment-time">${timeAgo(cDate)}</span>
                        </div>
                    </div>
                `;
            });
            commentsListEl.innerHTML = html;
        });

        activeCommentListeners[postId] = unsubscribe;
    }

    // Function to delete a post and all its comments
    async function deletePost(postId) {
        try {
            // 1. Fetch and delete all comments in the subcollection first
            const commentsRef = collection(db, `posts/${postId}/comments`);
            const commentsSnap = await getDocs(commentsRef);
            
            const deletePromises = [];
            commentsSnap.forEach((commentDoc) => {
                deletePromises.push(deleteDoc(doc(db, `posts/${postId}/comments`, commentDoc.id)));
            });
            
            // Wait for all comments to be deleted
            await Promise.all(deletePromises);

            // 2. Delete the post itself
            await deleteDoc(doc(db, "posts", postId));
            
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete the post.");
        }
    }
});
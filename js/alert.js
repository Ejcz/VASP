const alert = document.querySelector('.alert-box');
export function alert_display(text) {
    alert.innerHTML = text;
    alert.style.transitionDuration = '0.3s';
    alert.classList.add('alert-box-highlight');
    setTimeout(() => {
        alert.style.transitionDuration = '2s';
        alert.classList.remove('alert-box-highlight');
    }, 1800);
}

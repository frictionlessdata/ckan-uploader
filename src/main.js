import App from './App.svelte'

function mountCkanUploader(elementId, upload_url = '', dataset_id = '') {
  const app = new App({
    target: document.getElementById(elementId),
    props: {
      upload_url: upload_url,
      dataset_id: dataset_id
    }
  })
}
export default mountCkanUploader

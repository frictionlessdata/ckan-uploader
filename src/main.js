import App from './App.svelte'

function mountCkanUploader(elementId, upload_url = '', dataset_id = '', resource_id = '', url_type = '', current_url = '', update = '') {
  const app = new App({
    target: document.getElementById(elementId),
    props: {
      upload_url: upload_url,
      dataset_id: dataset_id,
      resource_id: resource_id,
      url_type: url_type,
      current_url: current_url,
      update: update
    }
  })
}
export default mountCkanUploader

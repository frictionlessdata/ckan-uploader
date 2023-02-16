<script>
  import CkanUploader from './lib/CkanUploader.svelte'
  import { createEventDispatcher } from 'svelte';


  export let upload_url
  export let dataset_id
  export let resource_id
  export let update
  export let current_url
  export let url_type

  let dispatch = createEventDispatcher()
  let el 

  // we need this to propagate the event from the uploader to outside of the svelte component, otherwise
  // we can't listen to events outside the widget
  function handleEvent(evt) {
    el.parentNode.dispatchEvent(new CustomEvent('fileUploaded', {'detail': evt.detail.data }))
  }

</script>

<main bind:this={el}>
  <CkanUploader upload_url={upload_url} dataset_id={dataset_id} resource_id={resource_id} update={update} current_url={current_url} url_type={url_type} on:fileUploaded={handleEvent}/>
</main>

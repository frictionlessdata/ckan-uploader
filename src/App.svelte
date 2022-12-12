<script>
  import CkanUploader from './lib/CkanUploader.svelte'
  import { createEventDispatcher } from 'svelte';


  export let upload_url
  export let dataset_id
  export let resource_id
  export let update
  export let current_url

  let dispatch = createEventDispatcher()
  let el 

  function handleEvent(evt) {
    el.parentNode.dispatchEvent(new CustomEvent('fileUploaded', {'detail': evt.detail.data.result }))
  }

</script>

<main class="tailwind" bind:this={el}>
  <CkanUploader upload_url={upload_url} dataset_id={dataset_id} resource_id={resource_id} update={update} current_url={current_url} on:fileUploaded={handleEvent}/>
</main>

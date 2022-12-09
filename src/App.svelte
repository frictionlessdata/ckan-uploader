<script>
  import CkanUploader from './lib/CkanUploader.svelte'
  import { createEventDispatcher } from 'svelte';


  export let upload_url
  export let dataset_id
  let dispatch = createEventDispatcher()
  let el 

  function handleEvent(evt) {
    console.log(evt)
    el.parentNode.dispatchEvent(new CustomEvent('fileUploaded', {'detail': evt.detail.data.result }))
  }

</script>

<main class="tailwind" bind:this={el}>
<CkanUploader upload_url={upload_url} dataset_id={dataset_id} on:fileUploaded={handleEvent}/>
</main>

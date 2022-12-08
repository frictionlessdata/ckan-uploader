<script>
  import CkanUploader from './lib/CkanUploader.svelte'

  export let upload_url
  export let dataset_id

</script>

<main>

<CkanUploader upload_url={upload_url} dataset_id={dataset_id}/>
</main>

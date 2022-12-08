<script>
  import '../app.css'
  import axios from 'axios';
  import { onMount } from 'svelte';

  let fileVar;
  export let upload_url;
  export let dataset_id;
  let percentage = 0;
  let is_uploading = false
  let is_waiting = false
  let is_completed = false

  async function uploadFile (body, setPercentage) {
    try {
      const options = {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
  
          if (percent <= 100) {
            setPercentage(percent);
            if (percent == 100) { 
              is_uploading = false
              is_waiting = true
            }
          }
        }
      };
  
      const { data } = await axios.post(
        upload_url + "/api/3/action/resource_create",
        body,
        options
      );
  
      return data;
    } catch (error) {
      console.log('ERROR', error.message);
    }
  }

  function setPercentage(newPercentage) {
    percentage = newPercentage
  }

  async function handleFileChange(event) {
    try {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("upload", file);
      formData.append("package_id", dataset_id)

      is_uploading = true
      await uploadFile(formData, setPercentage);
      is_waiting = false
      is_completed = true
    } catch (err) {
      console.log('ERROR', err);
      setPercentage(0);
    }
  }
</script>

<div id="fileUploadWidget" class="border-solid border-2 rounded border-sky-900 bg-sky-500 flex place-content-center">
  <div id="label" class="w-full relative flex place-content-center text-sky-100">
  {#if !is_uploading && !is_waiting && !is_completed}
    Select a file to upload
  {:else }
  <div id="percentage" class="relative w-full flex place-content-center">
    <div class="z-20">
    {#if !is_waiting }
{#if !is_completed}
    {percentage}%
{/if}
    {:else}
    Waiting for data schema detection...
    {/if}
    {#if is_completed }
    File uploaded
    {/if}
    </div>
    <div id="percentage-bar" style:width="{percentage}%" class="ease-in duration-300 z-10 absolute top-0 left-0 bottom-0 bg-blue-800">
    </div>
  </div>
  {/if}
  </div>

  <input id="fileUpload" type="file" bind:files={fileVar} on:change={handleFileChange}>
</div>


<style>
  #fileUploadWidget {
    position: relative;
    display: flex;
    max-width: 300px;
  }

  #fileUpload {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
  }

</style>

<script>
  import '../app.css'
  import axios from 'axios';
  import { onMount, createEventDispatcher } from 'svelte';

  export let upload_url;
  export let dataset_id;
  export let resource_id;
  export let update = '';
  export let current_url;
  export let url_type = ''
  
  let fileVar;
  let percentage = 0;
  let is_uploading = false
  let is_waiting = false
  let is_completed = false
  let dispatch = createEventDispatcher()
  let action_type = update?'update':'create'

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
        `${upload_url}/api/3/action/resource_${action_type}_with_schema`,
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

      // If it's updating a already existing resource
      // add some additional fields
      if (update) {
          formData.append("id", resource_id)
          formData.append("clear_upload", true)
          formData.append("url_type", url_type)
      }

      is_uploading = true
      let returnData = await uploadFile(formData, setPercentage);
      let eventData = {
        data: returnData
      }
      current_url = returnData.result.url
      url_type = 'upload'
      dispatch('fileUploaded', eventData)
      is_waiting = false
      is_completed = true
    } catch (err) {
      console.log('ERROR', err);
      setPercentage(0);
    }
  }
</script>
<div id="fileUploadWidget" class="border-solid border-2 rounded border-sky-900 bg-sky-500 flex h-8">
  <div id="label" class="w-full h-full relative text-sky-100 place-content-center justify-center flex">
  {#if !is_uploading && !is_waiting && !is_completed}
    {#if update}
      Select a file to replace the current one
    {:else}
    Select a file to upload
    {/if}
  {:else }
  <div id="percentage" class="w-full h-full text-center align-middle flex justify-center">
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
<div style="display: { (url_type != 'upload')?'inline':'none' }" class="controls pt-4">
  <label for="field_url">URL</label> <input id="field_url" styleclass="form-control" type="text" name="url" bind:value={current_url}>
</div>

<style>
  #fileUploadWidget {
    position: relative;
    display: flex;
    max-width: 400px;
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

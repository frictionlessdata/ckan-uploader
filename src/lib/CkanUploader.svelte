<script>
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
  
      const ckan_endpoint = (action_type == 'update') ?
          `${upload_url}/dataset/${dataset_id}/resource/${resource_id}/file` :
          `${upload_url}/dataset/${dataset_id}/resource/file`

      const { data } = await axios.post(
        ckan_endpoint,
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
        data: returnData,
      }
      current_url = returnData.url
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
<div class="form-group">
  <div id="fileUploadWidget">
    <div id="widget-label">
    {#if !is_uploading && !is_waiting && !is_completed}
      {#if update}
        Select a file to replace the current one
      {:else}
      Select a file to upload
      {/if}
    {:else }
    <div id="percentage">
      <div class="percentage-text">
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
      <div id="percentage-bar" style:width="{percentage}%">
      </div>
    </div>
    {/if}
    </div>
    <input id="fileUpload" type="file" bind:files={fileVar} on:change={handleFileChange}>
  </div>
  <div style="display: { (url_type != 'upload')?'inline':'none' }" class="controls">
    <label class="control-label" for="field_url">URL</label>
    <div class="controls">
      <input id="field_url" class="form-control" type="text" name="url" bind:value={current_url}>
    </div>
  </div>
</div>

<style>
  #fileUploadWidget {
    position: relative;
    display: flex;
    max-width: 400px;
    border: 2px solid #0c4a6e;
    border-radius: 4px;
    background-color: rgb(22, 73, 89);
    margin-bottom: 10px;
  }

  #fileUploadWidget #widget-label {
    width: 100%;
    height: 100%;
    color: white;
    justify-content: center;
    display: flex;
  }

  #percentage {
    width: 100%;
    height: 100%;
    align: middle;
    justify-content: center;
    display: flex;
    position: relative;
  }

  .percentage-text {
    z-index: 20;
  }

  #percentage-bar {
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    transition: width 0.3s;
    transition-timing-function: ease-in;
    background-color: rgba(255, 255, 255, 0.33);
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

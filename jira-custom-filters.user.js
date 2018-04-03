// ==UserScript==
// @name         Jira Filters
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Jira Custom Filters without admin access
// @author       D4ST1N
// @require      https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js
// @match        https://jira.betlab.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  Vue.component(
    'jcf',
    {
      template: `
          <div class="jcf-root">
            <div class="jcf-container">
              <button class="jcf-show-assignee" @click="showFilters"><<</button>
              <div v-show="filtersShow" class="jcf-filters">
                <div class="jcf-filters__overlay" @click.self="closeFilters">
                  <div class="jcf-filters__content">
                    <div v-for="filter in filters" class="jcf-filters__filter-block">
                      <input type="checkbox" class="jcf-filters__filter-checkbox" :checked="filter.checked" @change="toggleFilter(filter)">
                      <span class="jcf-filters__filter-name">{{ filter.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`,
      data() {
        return {
          styles: document.createElement('style'),
          assigneeList: [],
          filtersShow: false,
          filters: [
            {
              name: 'All',
              checked: true,
              filter() {
                return true;
              }
            },
          ],
          baseStyles: `
          #app2 {
              position: fixed;
              z-index: 1;
          }
          .jcf-root {
              position: fixed;
              top: 120px;
              right: 20px;
          }
          .jcf-filters__overlay {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              position: fixed;
              width: 100%;
              height: 100%;
              left: 0;
              top: 0;
              background: rgba(0,0,0,.7);
          }
          .jcf-filters__content {
              background: rgba(255,255,255,.8);
              display: flex;
              flex-direction: column;
              padding: 20px 40px;
              margin-right: 50px;
          }
          .jcf-filters__filter-block {
              font-size: 20px;
          }`,
        };
      },
      mounted() {
        this.createStyles();
      },
      computed: {
      },
      methods:  {
        getIssues() {
          return document.querySelectorAll('.ghx-issue');
        },
        getIssueAssignee(issue) {
          const avatar = issue.querySelector('.ghx-avatar-img');

          if (avatar) {
            return avatar.getAttribute('data-tooltip').replace('Assignee: ', '');
          }

          return undefined;
        },
        getAssigneeList() {
          const issues = this.getIssues();
          issues.forEach((issue) => {
            const name = this.getIssueAssignee(issue);

            if (name && !this.assigneeList.includes(name)) {
              this.assigneeList.push(name);
            }
          });
          this.assigneeList.forEach((name) => {
            this.filters.push(
              {
                name,
                filter(assignee) {
                  return assignee === this.name;
                },
              },
            );
          });
        },
        filterIssues() {
          const issues = this.getIssues();
          issues.forEach((issue) => {
            const name = this.getIssueAssignee(issue);
            let result = false;
            this.filters.forEach((filter) => {
              if (filter.checked) {
                if (filter.filter(name)) {
                  result = true;
                }
              }
            });

            if (result) {
              issue.style.display = 'block';
            } else {
              issue.style.display = 'none';
            }
          });
        },
        createStyles() {
          document.body.appendChild(this.styles);
          this.styles.innerHTML = this.baseStyles;
        },
        showFilters() {
          this.getAssigneeList();
          this.filtersShow = true;
          this.filterIssues();
        },
        closeFilters() {
          this.filtersShow = false;
        },
        toggleFilter(filter) {
          filter.checked = !filter.checked;
          this.filterIssues();
        },
      },
    }
  );

  const appRoot = document.createElement('div');
  appRoot.id = 'app2';
  appRoot.innerHTML = '<jcf></jcf>';
  document.body.appendChild(appRoot);
  new Vue(
    {
      el: '#app2',
    }
  );
})();
